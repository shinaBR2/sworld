import {
  TelegramCodeExpiredError,
  TelegramError,
  TelegramInvalidCodeError,
  TelegramLoginNotStartedError,
  TelegramMisconfiguredError,
  TelegramNotAuthenticatedError,
  TelegramNotProvisionedError,
  TelegramSessionPersistError,
  TelegramSignUpRequiredError,
  TelegramTwoFactorNotSupportedError,
} from 'src/services/telegram/errors';

/**
 * Stable machine-readable codes the action routes put in the response `message`
 * on failure. The response contract (actions.graphql) says "dataObject is null on
 * failure, message carries the reason", so `message` IS the channel the extension
 * branches on — most importantly `NO_SESSION`, which tells the popup to show the
 * login-code prompt instead of the video picker. Codes (not prose) so the client
 * match is exact and refactor-safe; the extension maps them to friendly copy.
 */
const TelegramActionErrorCode = {
  /** No authorized session yet — the popup shows the login-code prompt. */
  NO_SESSION: 'NO_SESSION',
  /** No credentials row at all — the owner must provision it out-of-band. */
  NOT_PROVISIONED: 'NOT_PROVISIONED',
  /** The provisioned row has a malformed api_id/api_hash/phone_number. */
  MISCONFIGURED: 'MISCONFIGURED',
  /** submitLoginCode with no preceding requestLoginCode. */
  LOGIN_NOT_STARTED: 'LOGIN_NOT_STARTED',
  /** Wrong/empty code — re-prompt against the same pending login. */
  INVALID_CODE: 'INVALID_CODE',
  /** Code aged out — the popup auto-requests a fresh one. */
  CODE_EXPIRED: 'CODE_EXPIRED',
  /** Telegram has no account for the provisioned phone. */
  SIGNUP_REQUIRED: 'SIGNUP_REQUIRED',
  /** Account has a 2FA password — deliberately unsupported this pass. */
  TWO_FACTOR_UNSUPPORTED: 'TWO_FACTOR_UNSUPPORTED',
  /** Login state could not be saved — request a fresh code and retry. */
  PERSIST_FAILED: 'PERSIST_FAILED',
} as const;

type TelegramActionErrorCode =
  (typeof TelegramActionErrorCode)[keyof typeof TelegramActionErrorCode];

// One entry per concrete TelegramError subclass. Keyed on the class so a new
// error type is a compile-visible addition here, not a silent fall-through to the
// generic path.
const CODE_BY_ERROR = new Map<new (...args: never[]) => TelegramError, string>([
  [TelegramNotAuthenticatedError, TelegramActionErrorCode.NO_SESSION],
  [TelegramNotProvisionedError, TelegramActionErrorCode.NOT_PROVISIONED],
  [TelegramMisconfiguredError, TelegramActionErrorCode.MISCONFIGURED],
  [TelegramLoginNotStartedError, TelegramActionErrorCode.LOGIN_NOT_STARTED],
  [TelegramInvalidCodeError, TelegramActionErrorCode.INVALID_CODE],
  [TelegramCodeExpiredError, TelegramActionErrorCode.CODE_EXPIRED],
  [TelegramSignUpRequiredError, TelegramActionErrorCode.SIGNUP_REQUIRED],
  [
    TelegramTwoFactorNotSupportedError,
    TelegramActionErrorCode.TWO_FACTOR_UNSUPPORTED,
  ],
  [TelegramSessionPersistError, TelegramActionErrorCode.PERSIST_FAILED],
]);

/**
 * Map a thrown error to its stable action-error code, or `undefined` when it is
 * NOT a recognised TelegramError — the caller then falls back to a generic
 * failure message and error-logs the unexpected error. TelegramErrors are
 * expected control-flow (bad code, no session yet), so callers do not error-log
 * them; they carry only `userId`, never a secret.
 */
const toTelegramActionErrorCode = (error: unknown): string | undefined => {
  if (!(error instanceof TelegramError)) {
    return undefined;
  }
  return (
    CODE_BY_ERROR.get(
      error.constructor as new (
        ...args: never[]
      ) => TelegramError,
    ) ?? error.name
  );
};

export { TelegramActionErrorCode, toTelegramActionErrorCode };
