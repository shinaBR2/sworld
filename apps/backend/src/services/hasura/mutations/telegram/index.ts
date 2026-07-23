import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import type {
  SaveTelegramPendingLoginMutation,
  SaveTelegramPendingLoginMutationVariables,
  SaveTelegramSessionMutation,
  SaveTelegramSessionMutationVariables,
} from '../../generated-graphql/graphql';
import { redactHasuraError } from '../../redactError';

// Both mutations UPDATE an existing row (never INSERT): the credentials row is
// provisioned out-of-band (owner inserts phone/api_id/api_hash by hand), and
// UNIQUE(user_id) means an INSERT on retry would hit a duplicate-key error.
// `affected_rows === 0` is the signal that no row exists for this user.

// After sendCode: persist the intermediate (unauthorized) MTProto session into
// the SEPARATE pending_session_string column, plus the phone_code_hash. This
// deliberately never touches session_string — that column only ever holds an
// AUTHORIZED session, so a re-login started while a working session exists can be
// abandoned without destroying the session that list/import still rely on. The
// pair (pendingSessionString, pendingPhoneCodeHash) is the login-in-progress state.
const SAVE_TELEGRAM_PENDING_LOGIN = graphql(/* GraphQL */ `
  mutation SaveTelegramPendingLogin(
    $userId: uuid!
    $pendingSessionString: String!
    $phoneCodeHash: String!
  ) {
    update_telegram_credentials(
      where: { user_id: { _eq: $userId } }
      _set: {
        pendingSessionString: $pendingSessionString
        pendingPhoneCodeHash: $phoneCodeHash
      }
    ) {
      affected_rows
    }
  }
`);

// After signIn: promote the now-authorized session into session_string and clear
// BOTH pending fields, moving the row into the "ready" state (session_string set).
const SAVE_TELEGRAM_SESSION = graphql(/* GraphQL */ `
  mutation SaveTelegramSession($userId: uuid!, $sessionString: String!) {
    update_telegram_credentials(
      where: { user_id: { _eq: $userId } }
      _set: {
        sessionString: $sessionString
        pendingSessionString: null
        pendingPhoneCodeHash: null
      }
    ) {
      affected_rows
    }
  }
`);

interface SaveTelegramPendingLoginParams {
  userId: string;
  pendingSessionString: string;
  phoneCodeHash: string;
}

const saveTelegramPendingLogin = async ({
  userId,
  pendingSessionString,
  phoneCodeHash,
}: SaveTelegramPendingLoginParams) => {
  try {
    const response = await hasuraClient.request<
      SaveTelegramPendingLoginMutation,
      SaveTelegramPendingLoginMutationVariables
    >({
      document: SAVE_TELEGRAM_PENDING_LOGIN.toString(),
      variables: { userId, pendingSessionString, phoneCodeHash },
    });

    return response.update_telegram_credentials?.affected_rows ?? 0;
  } catch (error) {
    // A raw failure embeds pendingSessionString (a session secret) in its
    // message — redact before it can be logged/retried/threaded as a cause.
    throw redactHasuraError('saveTelegramPendingLogin', error);
  }
};

interface SaveTelegramSessionParams {
  userId: string;
  sessionString: string;
}

const saveTelegramSession = async ({
  userId,
  sessionString,
}: SaveTelegramSessionParams) => {
  try {
    const response = await hasuraClient.request<
      SaveTelegramSessionMutation,
      SaveTelegramSessionMutationVariables
    >({
      document: SAVE_TELEGRAM_SESSION.toString(),
      variables: { userId, sessionString },
    });

    return response.update_telegram_credentials?.affected_rows ?? 0;
  } catch (error) {
    // A raw failure embeds sessionString (the authorized session — a password
    // equivalent) in its message — redact before it can be logged/retried/threaded.
    throw redactHasuraError('saveTelegramSession', error);
  }
};

export { saveTelegramPendingLogin, saveTelegramSession };
