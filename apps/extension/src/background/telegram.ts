import { hasuraConfig } from '../../envConfig';
import { getToken } from './auth';

// One row of the picker — mirrors `TelegramVideoMessage` in the Hasura action
// schema (apps/hasura actions.graphql / SWO-493). `thumbnailDataUri` is an inline
// data: URI so the popup renders a preview with no extra fetch; `caption` is often
// the only human-readable label when a raw video attachment has no `filename`.
interface TelegramVideoMessage {
  id: string;
  filename?: string;
  caption?: string;
  date: string;
  sizeBytes?: number;
  durationSeconds?: number;
  thumbnailDataUri?: string;
}

// The stable `message` code the gateway `list` route returns when the user has no
// authorized Telegram session yet — the popup's cue to show the login prompt
// instead of the picker (SWO-494). Kept as a shared constant so the background
// and popup agree on the exact string.
const NO_SESSION = 'NO_SESSION';

// Every Telegram action returns this envelope (`{ success, message, dataObject }`).
// `dataObject` is null on failure, and `message` carries the reason — including
// `NO_SESSION`.
interface ActionEnvelope<T> {
  success: boolean;
  message: string;
  dataObject?: T | null;
}

// A stalled request must never hang the popup forever: without a deadline a
// dead connection leaves the `await` in the background handler unresolved, so
// `sendResponse` never fires and the spinner spins indefinitely. The ceiling
// sits above Hasura's own 30s Action timeout so a genuinely slow-but-alive
// backend still returns its real error rather than being cut off here.
const REQUEST_TIMEOUT_MS = 35_000;

/**
 * Call a Telegram Hasura Action from the background with the bridged Auth0 token,
 * exactly like `watch.ts`/`library.ts` — raw fetch to the GraphQL endpoint, the
 * action invoked as a mutation field. Normalizes every failure (no token,
 * transport/GraphQL error, timeout) into the same `{ success:false, message }`
 * envelope so callers branch on one shape. `actionField` is the mutation field
 * name to unwrap.
 */
const callTelegramAction = async <T>(
  actionField: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<ActionEnvelope<T>> => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, message: 'Not authenticated', dataObject: null };
    }

    const response = await fetch(hasuraConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const json = await response.json();
    if (json.errors) {
      return {
        success: false,
        message: json.errors[0]?.message ?? 'Request failed',
        dataObject: null,
      };
    }

    const result = json.data?.[actionField] as ActionEnvelope<T> | undefined;
    if (!result) {
      return { success: false, message: 'Empty response', dataObject: null };
    }
    return result;
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === 'TimeoutError';
    return {
      success: false,
      message: timedOut
        ? 'The request timed out. Try again.'
        : error instanceof Error
          ? error.message
          : 'Network error',
      dataObject: null,
    };
  }
};

interface ListResult {
  success: boolean;
  message: string;
  videos: TelegramVideoMessage[];
  nextCursor?: string;
}

const LIST_QUERY = `
  mutation ListTelegramChannelVideos($input: ListTelegramChannelVideosInput!) {
    listTelegramChannelVideos(input: $input) {
      success
      message
      dataObject {
        videos { id filename caption date sizeBytes durationSeconds thumbnailDataUri }
        nextCursor
      }
    }
  }
`;

const listTelegramChannelVideos = async (
  channelId: string,
  cursor?: string,
): Promise<ListResult> => {
  const res = await callTelegramAction<{
    videos: TelegramVideoMessage[];
    nextCursor?: string | null;
  }>('listTelegramChannelVideos', LIST_QUERY, { input: { channelId, cursor } });

  return {
    success: res.success,
    message: res.message,
    videos: res.dataObject?.videos ?? [],
    nextCursor: res.dataObject?.nextCursor ?? undefined,
  };
};

const IMPORT_QUERY = `
  mutation ImportTelegramArchive($input: ImportTelegramArchiveInput!) {
    importTelegramArchive(input: $input) {
      success
      message
      dataObject { taskId }
    }
  }
`;

const importTelegramArchive = async (
  channelId: string,
  messageIds: string[],
): Promise<{ success: boolean; message: string; taskId?: string }> => {
  const res = await callTelegramAction<{ taskId: string }>(
    'importTelegramArchive',
    IMPORT_QUERY,
    { input: { channelId, messageIds } },
  );
  return {
    success: res.success,
    message: res.message,
    taskId: res.dataObject?.taskId,
  };
};

const REQUEST_LOGIN_CODE_QUERY = `
  mutation RequestTelegramLoginCode {
    requestTelegramLoginCode { success message }
  }
`;

const requestTelegramLoginCode = (): Promise<{
  success: boolean;
  message: string;
}> =>
  callTelegramAction('requestTelegramLoginCode', REQUEST_LOGIN_CODE_QUERY, {});

const SUBMIT_LOGIN_CODE_QUERY = `
  mutation SubmitTelegramLoginCode($input: SubmitTelegramLoginCodeInput!) {
    submitTelegramLoginCode(input: $input) { success message }
  }
`;

const submitTelegramLoginCode = (
  code: string,
): Promise<{ success: boolean; message: string }> =>
  callTelegramAction('submitTelegramLoginCode', SUBMIT_LOGIN_CODE_QUERY, {
    input: { code },
  });

export {
  NO_SESSION,
  listTelegramChannelVideos,
  importTelegramArchive,
  requestTelegramLoginCode,
  submitTelegramLoginCode,
  type TelegramVideoMessage,
  type ListResult,
};
