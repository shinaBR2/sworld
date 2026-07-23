import type { ListResult } from '../background/telegram';

// Popup → background request/response over `chrome.runtime.sendMessage`, promisified
// so the Telegram components can `await` a background action's result. Mirrors how
// `AuthPanel` calls `GET_AUTH_STATUS` with a callback, wrapped for async/await.
// The availability check is at call time (not module load) so it reflects the
// current `chrome` global rather than whatever existed when this module loaded.
const sendTelegramMessage = <T>(
  type: string,
  payload?: Record<string, unknown>,
): Promise<T | undefined> =>
  new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
      resolve(undefined);
      return;
    }
    // `sendMessage` can throw *synchronously* ("Extension context invalidated")
    // when the service worker is torn down while the popup is open — the
    // `runtime.id` check above doesn't cover that. Without this guard the throw
    // rejects the promise and the awaiting component hangs on its busy flag.
    try {
      chrome.runtime.sendMessage({ type, payload }, (response: T) => {
        // Touch `lastError` so Chrome doesn't log an "Unchecked runtime.lastError"
        // warning when the port closed before responding; callers treat the
        // resulting `undefined` as an unreachable-background error.
        void chrome.runtime.lastError;
        resolve(response);
      });
    } catch {
      resolve(undefined);
    }
  });

interface Envelope {
  success: boolean;
  message: string;
}

const listVideos = (cursor?: string) =>
  sendTelegramMessage<ListResult>('TELEGRAM_LIST_VIDEOS', { cursor });

const importArchive = (messageIds: string[]) =>
  sendTelegramMessage<Envelope & { taskId?: string }>('TELEGRAM_IMPORT', {
    messageIds,
  });

const requestLoginCode = () =>
  sendTelegramMessage<Envelope>('TELEGRAM_REQUEST_LOGIN_CODE');

const submitLoginCode = (code: string) =>
  sendTelegramMessage<Envelope>('TELEGRAM_SUBMIT_LOGIN_CODE', { code });

export {
  listVideos,
  importArchive,
  requestLoginCode,
  submitLoginCode,
  type Envelope,
};
