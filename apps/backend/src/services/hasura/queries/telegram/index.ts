import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import type {
  GetTelegramCredentialsByUserIdQuery,
  GetTelegramCredentialsByUserIdQueryVariables,
} from '../../generated-graphql/graphql';
import { redactHasuraError } from '../../redactError';

// One telegram_credentials row, as returned to the backend (admin-secret query).
type TelegramCredentials =
  GetTelegramCredentialsByUserIdQuery['telegram_credentials'][number];

// telegram_credentials has UNIQUE(user_id) but its primary key is `id`, so there
// is no `_by_pk` on user_id — a filtered select with limit 1 is the lookup.
// The camelCase fields (phoneNumber/apiId/apiHash/sessionString/…) are Hasura
// custom column names; user_id is left un-remapped, matching device_requests.
const GET_TELEGRAM_CREDENTIALS_BY_USER_ID = graphql(/* GraphQL */ `
  query GetTelegramCredentialsByUserId($userId: uuid!) {
    telegram_credentials(where: { user_id: { _eq: $userId } }, limit: 1) {
      phoneNumber
      apiId
      apiHash
      sessionString
      pendingSessionString
      pendingPhoneCodeHash
    }
  }
`);

// Explicit `| null` return type: TS treats `array[0]` as always-defined
// (no noUncheckedIndexedAccess), so without this annotation the `?? null` is
// dead and callers' "not found" guards would be typed as unreachable.
const getTelegramCredentialsByUserId = async (
  userId: string,
): Promise<TelegramCredentials | null> => {
  try {
    const response = await hasuraClient.request<
      GetTelegramCredentialsByUserIdQuery,
      GetTelegramCredentialsByUserIdQueryVariables
    >({
      document: GET_TELEGRAM_CREDENTIALS_BY_USER_ID.toString(),
      variables: { userId },
    });

    return response.telegram_credentials[0] ?? null;
  } catch (error) {
    // This row holds the session secrets; a raw ClientError can embed the
    // returned data — redact before it can propagate into logs.
    throw redactHasuraError('getTelegramCredentialsByUserId', error);
  }
};

export { getTelegramCredentialsByUserId };
export type { TelegramCredentials };
