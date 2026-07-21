import { envConfig } from 'src/utils/envConfig';
import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';

/** MTProto client tuning: same retry budget shown in teleproto's own quick start. */
const CONNECTION_RETRIES = 5;

let telegramClient: TelegramClient | null = null;

/**
 * Build a new `TelegramClient` from `TG_API_ID` / `TG_API_HASH` / `TELEGRAM_SESSION`.
 * Does NOT connect — callers invoke `.connect()` themselves when they need a live
 * MTProto connection. Never log `session` (or any part of it): it is a long-lived
 * credential equivalent to a password.
 */
const createTelegramClient = (): TelegramClient => {
  const apiId = envConfig.telegramApiId;
  const apiHash = envConfig.telegramApiHash;
  const session = envConfig.telegramSession;

  if (!apiId) {
    throw new Error(
      'Telegram API ID is not defined. Please check environment variables.',
    );
  }
  if (!apiHash) {
    throw new Error(
      'Telegram API hash is not defined. Please check environment variables.',
    );
  }
  if (!session) {
    throw new Error(
      'Telegram session is not defined. Please check environment variables.',
    );
  }

  // Number('') is 0 and Number.isInteger(0) is true, so a blank/whitespace
  // value would silently pass as apiId 0 without the trim() check.
  const numericApiId = Number(apiId);
  if (!apiId.trim() || !Number.isInteger(numericApiId)) {
    throw new Error('Telegram API ID must be a valid integer.');
  }

  return new TelegramClient(new StringSession(session), numericApiId, apiHash, {
    connectionRetries: CONNECTION_RETRIES,
  });
};

/**
 * Lazily creates and memoizes a single `TelegramClient` instance per process —
 * same lazy-singleton shape as `getDefaultBucket()`
 * (`src/services/videos/helpers/gcp-cloud-storage/index.ts`). Both `gateway` and
 * `io` import this so there is exactly one client-creation implementation.
 */
const getTelegramClient = (): TelegramClient => {
  if (!telegramClient) {
    telegramClient = createTelegramClient();
  }
  return telegramClient;
};

export { createTelegramClient, getTelegramClient };
