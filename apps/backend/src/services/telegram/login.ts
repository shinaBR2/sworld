import {
  saveTelegramPendingLogin,
  saveTelegramSession,
} from 'src/services/hasura/mutations/telegram';
import { isRetryableError, withRetry } from 'src/utils/retry/withRetry';
import { Api } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { loadTelegramLoginCredentials, withTelegramClient } from './client';
import {
  TelegramCodeExpiredError,
  type TelegramError,
  TelegramInvalidCodeError,
  TelegramLoginNotStartedError,
  TelegramMisconfiguredError,
  TelegramNotProvisionedError,
  TelegramSessionPersistError,
  TelegramSignUpRequiredError,
  TelegramTwoFactorNotSupportedError,
} from './errors';

/** teleproto rejects RPC calls with an RPCError carrying an `errorMessage`. */
const rpcErrorMessage = (error: unknown): string | undefined =>
  typeof error === 'object' &&
  error !== null &&
  typeof (error as { errorMessage?: unknown }).errorMessage === 'string'
    ? (error as { errorMessage: string }).errorMessage
    : undefined;

/** A wrong/empty login code — recoverable against the same pending session. */
const INVALID_CODE_MESSAGES = new Set([
  'PHONE_CODE_INVALID',
  'PHONE_CODE_EMPTY',
]);
/** A bad provisioned phone number — the operator must fix the credentials row. */
const MISCONFIGURED_PHONE_MESSAGES = new Set([
  'PHONE_NUMBER_INVALID',
  'PHONE_NUMBER_BANNED',
]);

/**
 * Translate a raw teleproto RPCError (from sendCode or auth.SignIn) into the
 * typed telegram-error taxonomy the gateway (SWO-494) routes on, or `undefined`
 * when it isn't one we classify (the caller rethrows it raw). Shared by both
 * login steps so the mapping lives in one place.
 *
 * Only PRODUCT-MEANINGFUL conditions are typed here — states with a distinct
 * recovery the popup routes on (bad code, expired code, sign-up required, bad
 * provisioning, 2FA-not-supported). Everything else is left raw ON PURPOSE:
 * connect-time transport/DC failures (the TelegramClient already retries these
 * internally via connectionRetries, so an escaped one is a hard infra outage with
 * no distinct popup state) and exotic alternate-auth states (a Telegram
 * login-email account can't complete phone-code sign-in) surface raw and are
 * handled by the gateway's generic-error path — the same path any unexpected
 * backend error takes — rather than growing this map to chase the full MTProto
 * RPC-error space. A 2FA password (SESSION_PASSWORD_NEEDED) is the one alternate
 * state we DO type, as an explicit "not supported" signal.
 */
const toTypedTelegramError = (
  error: unknown,
  userId: string,
): TelegramError | undefined => {
  const message = rpcErrorMessage(error);
  if (message === undefined) {
    return undefined;
  }
  // Preserve the raw RPCError as `cause` on every mapped error so the original
  // errorMessage/stack survives for diagnosis.
  if (message === 'SESSION_PASSWORD_NEEDED') {
    return new TelegramTwoFactorNotSupportedError(userId, { cause: error });
  }
  // Expired is NOT folded into invalid: the recovery differs (fresh code vs
  // re-prompt), so it gets its own typed error the popup can route on.
  if (message === 'PHONE_CODE_EXPIRED') {
    return new TelegramCodeExpiredError(userId, { cause: error });
  }
  if (INVALID_CODE_MESSAGES.has(message)) {
    return new TelegramInvalidCodeError(userId, { cause: error });
  }
  // No Telegram account for the provisioned phone — same product state as
  // auth.SignIn's AuthorizationSignUpRequired result.
  if (message === 'PHONE_NUMBER_UNOCCUPIED') {
    return new TelegramSignUpRequiredError(userId, { cause: error });
  }
  if (MISCONFIGURED_PHONE_MESSAGES.has(message)) {
    return new TelegramMisconfiguredError(userId, { cause: error });
  }
  return undefined;
};

/** Rethrow a raw MTProto error as its typed equivalent when recognised. */
const rethrowTyped = (error: unknown, userId: string): never => {
  throw toTypedTelegramError(error, userId) ?? error;
};

/**
 * Persist a login step's state (an idempotent UPDATE returning affected_rows)
 * with retry, and on final/non-retryable failure surface a typed, routable
 * TelegramSessionPersistError instead of the raw hasura error. Shared by BOTH
 * persists — the pending state after sendCode and the authorized session after
 * the irreversible auth.SignIn — so each has the same guarantees: retry absorbs a
 * transient blip (a dropped write would otherwise force a second sendCode → risk
 * FLOOD_WAIT, or, post-SignIn, trap the user on a spent code with a misleading
 * "invalid code"), and the gateway always gets an `instanceof TelegramError` to
 * route rather than an unroutable 500. A vanished row returns affected_rows: 0
 * (not a throw) and is handled by the caller.
 */
const persistLoginStep = async (
  userId: string,
  label: string,
  persist: () => Promise<number>,
): Promise<number> =>
  withRetry(persist, { label, isRetryable: isRetryableError }).catch(
    (error) => {
      throw new TelegramSessionPersistError(userId, { cause: error });
    },
  );

/**
 * Step 1 of the in-product MTProto login: ask Telegram to send a login code to
 * the user's own device.
 *
 * Loads the user's provisioned phone/api credentials, calls `sendCode` on a
 * fresh connection, and persists BOTH the returned phone_code_hash AND the
 * intermediate (still-unauthorized) session string. The intermediate session
 * matters: the code Telegram just sent is only valid against the auth key
 * established on this connection, so `submitLoginCode` must resume that exact
 * session rather than start a new one.
 *
 * The intermediate session is written to pending_session_string, NOT
 * session_string — so if this user already has an authorized session, starting a
 * new login (and abandoning it) never destroys the working one. The pair
 * (pending_session_string, pending_phone_code_hash) is the login-in-progress
 * state that `submitLoginCode` consumes.
 */
const requestLoginCode = async (userId: string): Promise<void> => {
  const { credentials, apiId } = await loadTelegramLoginCredentials(userId);
  const session = new StringSession('');

  const affectedRows = await withTelegramClient(
    { session, apiId, apiHash: credentials.apiHash },
    async (client) => {
      const { phoneCodeHash } = await client
        .sendCode(
          { apiId, apiHash: credentials.apiHash },
          credentials.phoneNumber,
        )
        .catch((error) => rethrowTyped(error, userId));
      return persistLoginStep(userId, 'saveTelegramPendingLogin', () =>
        saveTelegramPendingLogin({
          userId,
          pendingSessionString: session.save(),
          phoneCodeHash,
        }),
      );
    },
  );

  if (affectedRows === 0) {
    // The row was deleted between the read above and this write. Telegram has
    // already texted a code, but there's nothing to consume it against — the row
    // is genuinely gone, so NotProvisioned is the correct signal (re-provision,
    // then request a fresh code). The narrow window is only reachable by the same
    // single user deleting their own row mid-login, and sendCode's side effect
    // can't be rolled back, so the stale code is an accepted, benign outcome.
    throw new TelegramNotProvisionedError(userId);
  }
};

/**
 * Step 2 of the login: complete sign-in with the code the user received.
 *
 * Rebuilds the client from the intermediate session saved by `requestLoginCode`
 * (pending_session_string, so the phone_code_hash is valid), calls `auth.signIn`,
 * and on success promotes the now-authorized session into session_string and
 * clears both pending fields — moving the row into the ready state.
 *
 * Non-success outcomes are handled so session_string is never populated with a
 * non-authorized session: auth.SignIn RESOLVES (not throws) with
 * `AuthorizationSignUpRequired` when the phone has no Telegram account, and it
 * REJECTS with codes (wrong/expired code, 2FA password, bad phone) that
 * `toTypedTelegramError` maps to the typed taxonomy. All surface as typed errors.
 */
const submitLoginCode = async (userId: string, code: string): Promise<void> => {
  const { credentials, apiId } = await loadTelegramLoginCredentials(userId);
  if (!credentials.pendingSessionString || !credentials.pendingPhoneCodeHash) {
    throw new TelegramLoginNotStartedError(userId);
  }

  // Capture into locals: the guard above narrows these to string, but that
  // narrowing would be lost inside the async callback closure below.
  const { phoneNumber, pendingPhoneCodeHash } = credentials;
  // Hold the StringSession instance (rather than reading back client.session,
  // typed as the abstract Session base) so .save() is typed to return string.
  const session = new StringSession(credentials.pendingSessionString);

  const affectedRows = await withTelegramClient(
    { session, apiId, apiHash: credentials.apiHash },
    async (client) => {
      const result = await client
        .invoke(
          new Api.auth.SignIn({
            phoneNumber,
            phoneCodeHash: pendingPhoneCodeHash,
            phoneCode: code,
          }),
        )
        .catch((error) => rethrowTyped(error, userId));

      if (result instanceof Api.auth.AuthorizationSignUpRequired) {
        // Session is NOT authorized — refuse to persist it as one.
        throw new TelegramSignUpRequiredError(userId);
      }

      // auth.SignIn is irreversible — the phone code is now consumed and this
      // authorized session exists only in memory — so persistLoginStep retries the
      // save and, on final failure, throws a typed TelegramSessionPersistError
      // (not the raw error, not a misleading "invalid code"). A vanished row
      // returns affected_rows: 0 (not a throw) and is handled below.
      return persistLoginStep(userId, 'saveTelegramSession', () =>
        saveTelegramSession({ userId, sessionString: session.save() }),
      );
    },
  );

  if (affectedRows === 0) {
    // Row deleted between the load above and this write, AFTER a successful
    // (irreversible) sign-in — the authorized session is orphaned. Same accepted
    // race as requestLoginCode: only the user's own concurrent row deletion can
    // reach it, and there's no row left to persist into, so NotProvisioned is the
    // honest signal (re-provision, then log in again).
    throw new TelegramNotProvisionedError(userId);
  }
};

export { requestLoginCode, submitLoginCode };
