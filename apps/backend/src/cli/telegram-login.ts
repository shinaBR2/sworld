#!/usr/bin/env tsx

/**
 * One-off interactive script to generate the long-lived TELEGRAM_SESSION string.
 *
 * MTProto login is per-account, not per-service: run this ONCE locally with the
 * owner's personal Telegram account, then paste the printed session string into
 * TELEGRAM_SESSION on both the `gateway` and `io` Cloud Run services (and local
 * `.env`). Telegram supports multiple simultaneous authorized connections from
 * one session string, so both services can hold their own live connection
 * without re-running this.
 *
 * Like `TG_API_ID`/`TG_API_HASH`, an existing `TELEGRAM_SESSION` in env is
 * reused rather than thrown away: if one is set, this script tries it first
 * and only falls into the full interactive phone+code+2FA flow when there is
 * none, or the existing one is no longer valid. Pass --force to skip the
 * reuse check and always generate a fresh session.
 *
 * This is NOT the shared `getTelegramClient()` singleton
 * (`src/services/telegram/client.ts`) — that helper requires an existing
 * TELEGRAM_SESSION and is for `gateway`/`io` runtime use. This script's whole
 * job is to produce/refresh that session in the first place, so it builds its
 * own client(s) directly rather than going through the singleton.
 *
 * Setup: get an api_id / api_hash pair from https://my.telegram.org, then
 * either export TG_API_ID / TG_API_HASH or pass them as flags.
 *
 * Usage:
 *   npx tsx src/cli/telegram-login.ts [--api-id <id>] [--api-hash <hash>] [--force]
 *
 * Manually verified by the operator — this repo has no real Telegram
 * credentials to run it end-to-end in CI/sandbox.
 */

import { createInterface } from 'node:readline/promises';
import { envConfig } from 'src/utils/envConfig';
import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { flushThenExit } from './cli-exit';

/** Same retry budget as the shared client (`src/services/telegram/client.ts`). */
const CONNECTION_RETRIES = 5;

// ─── Argument parsing ────────────────────────────────────────────────────────

interface LoginArgs {
  apiId: number;
  apiHash: string;
  force: boolean;
}

const getFlagValue = (rawArgs: string[], flag: string): string | undefined => {
  const idx = rawArgs.indexOf(flag);
  if (idx === -1) return undefined;
  const value = rawArgs[idx + 1];
  // A missing value (end of args, or another --flag) is treated as unset, not
  // silently swallowing the next flag as this one's value.
  return value && !value.startsWith('--') ? value : undefined;
};

const parseLoginArgs = (rawArgs: string[]): LoginArgs => {
  const apiIdRaw = getFlagValue(rawArgs, '--api-id') || envConfig.telegramApiId;
  const apiHash =
    getFlagValue(rawArgs, '--api-hash') || envConfig.telegramApiHash;

  if (!apiIdRaw) {
    console.error(
      'Error: api-id not provided. Pass --api-id <id> or set TG_API_ID (from https://my.telegram.org).',
    );
    process.exit(1);
  }
  if (!apiHash) {
    console.error(
      'Error: api-hash not provided. Pass --api-hash <hash> or set TG_API_HASH (from https://my.telegram.org).',
    );
    process.exit(1);
  }

  // Number('') is 0 and Number.isInteger(0) is true, so a blank/whitespace
  // value would silently pass as apiId 0 without the trim() check.
  const apiId = Number(apiIdRaw);
  if (!apiIdRaw.trim() || !Number.isInteger(apiId)) {
    console.error(`Error: api-id must be a valid integer, got "${apiIdRaw}".`);
    process.exit(1);
  }

  return { apiId, apiHash, force: rawArgs.includes('--force') };
};

// ─── Interactive prompt ──────────────────────────────────────────────────────

type Readline = ReturnType<typeof createInterface>;

const prompt = async (rl: Readline, question: string): Promise<string> =>
  (await rl.question(question)).trim();

// ─── Login flow ──────────────────────────────────────────────────────────────

/**
 * Try connecting with the `TELEGRAM_SESSION` already in env instead of
 * forcing a fresh login. `connect()` alone only proves the transport works —
 * an invalid/expired/revoked auth key still connects at the network level —
 * so `getMe()` is the actual validity check.
 *
 * Never logs `existingSession` itself, only the identity confirmation or the
 * (non-secret) error message from a failed connect/getMe.
 *
 * @returns true if the existing session is still valid (and the confirmation
 *   has been printed), false if it's missing/expired/revoked.
 */
const tryReuseSession = async (
  apiId: number,
  apiHash: string,
  existingSession: string,
): Promise<boolean> => {
  const client = new TelegramClient(
    new StringSession(existingSession),
    apiId,
    apiHash,
    { connectionRetries: CONNECTION_RETRIES },
  );

  try {
    await client.connect();
    const me = await client.getMe();
    console.log(
      `Existing TELEGRAM_SESSION is still valid — no login needed. Logged in as: @${me.username ?? 'unknown'} (id: ${me.id})`,
    );
    return true;
  } catch (error) {
    console.log(
      `Existing TELEGRAM_SESSION is no longer valid (${(error as Error).message}) — starting a fresh login.`,
    );
    return false;
  } finally {
    await client.disconnect();
  }
};

/** Full interactive phone+code+2FA flow, producing and printing a brand-new session. */
const runFreshLogin = async (
  rl: Readline,
  apiId: number,
  apiHash: string,
): Promise<void> => {
  // Start from a blank session — producing one is this function's entire job.
  // Kept as its own typed reference (rather than reading back `client.session`,
  // which is typed as the abstract `Session` base) so `.save()` returns `string`.
  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: CONNECTION_RETRIES,
  });

  try {
    await client.start({
      phoneNumber: () => prompt(rl, 'Phone number (with country code): '),
      password: () => prompt(rl, '2FA password (leave blank if none): '),
      phoneCode: () => prompt(rl, 'Login code sent by Telegram: '),
      onError: (error: Error) => console.error('Login error:', error.message),
    });

    // Identity check only — id/username, never anything session-related.
    const me = await client.getMe();
    console.log('');
    console.log(`Logged in as: @${me.username ?? 'unknown'} (id: ${me.id})`);

    const sessionString = session.save();
    console.log('');
    console.log('=== Session string — paste into TELEGRAM_SESSION ===');
    console.log(sessionString);
    console.log('=== End of session string ===');
  } finally {
    await client.disconnect();
  }
};

const runLogin = async (rawArgs: string[]): Promise<void> => {
  const { apiId, apiHash, force } = parseLoginArgs(rawArgs);
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log('=== Telegram MTProto Login ===');
  console.log(
    'One-time interactive login. On success this prints a session string —',
  );
  console.log(
    'paste it into TELEGRAM_SESSION on gateway/io. Treat it like a password:',
  );
  console.log('never commit it, never share it, never log it elsewhere.');
  console.log('');

  try {
    if (!force && envConfig.telegramSession) {
      const reused = await tryReuseSession(
        apiId,
        apiHash,
        envConfig.telegramSession,
      );
      if (reused) return;
    }
    await runFreshLogin(rl, apiId, apiHash);
  } finally {
    rl.close();
  }
};

// Only auto-run when executed directly (`npx tsx src/cli/telegram-login.ts`),
// not when imported — the unit test below imports `tryReuseSession` and must
// not trigger the real interactive login flow as an import side effect.
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runLogin(process.argv.slice(2))
    // Exit explicitly on success — MTProto keep-alive sockets can otherwise
    // keep the event loop alive, hanging the process after the script's done.
    .then(() => flushThenExit(0))
    .catch((error) => {
      console.error('');
      console.error('=== Error ===');
      console.error(error.message || error);
      flushThenExit(1);
    });
}

// Exported for unit testing the session-reuse branch (src/cli/** is otherwise
// excluded from codecov as standalone operator tooling — see codecov.yml).
export { tryReuseSession };
