import { TelegramClient } from 'teleproto';
import { StringSession } from 'teleproto/sessions';
import { envConfig } from 'src/utils/envConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTelegramClient } from './client';

vi.mock('teleproto', () => ({
  TelegramClient: vi.fn(),
}));

vi.mock('teleproto/sessions', () => ({
  StringSession: vi.fn(),
}));

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    telegramApiId: undefined,
    telegramApiHash: undefined,
    telegramSession: undefined,
  },
}));

describe('createTelegramClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(envConfig).telegramApiId = undefined;
    vi.mocked(envConfig).telegramApiHash = undefined;
    vi.mocked(envConfig).telegramSession = undefined;
  });

  it('should create a TelegramClient built from the env vars when all are present', () => {
    vi.mocked(envConfig).telegramApiId = '123';
    vi.mocked(envConfig).telegramApiHash = 'test-hash';
    vi.mocked(envConfig).telegramSession = 'test-session';

    createTelegramClient();

    expect(StringSession).toHaveBeenCalledWith('test-session');
    expect(TelegramClient).toHaveBeenCalledWith(
      expect.any(StringSession),
      123,
      'test-hash',
      { connectionRetries: 5 },
    );
  });

  it('should throw when the API ID is not defined', () => {
    vi.mocked(envConfig).telegramApiHash = 'test-hash';
    vi.mocked(envConfig).telegramSession = 'test-session';

    expect(() => createTelegramClient()).toThrow(
      'Telegram API ID is not defined. Please check environment variables.',
    );
  });

  it('should throw when the API hash is not defined', () => {
    vi.mocked(envConfig).telegramApiId = '123';
    vi.mocked(envConfig).telegramSession = 'test-session';

    expect(() => createTelegramClient()).toThrow(
      'Telegram API hash is not defined. Please check environment variables.',
    );
  });

  it('should throw when the session is not defined', () => {
    vi.mocked(envConfig).telegramApiId = '123';
    vi.mocked(envConfig).telegramApiHash = 'test-hash';

    expect(() => createTelegramClient()).toThrow(
      'Telegram session is not defined. Please check environment variables.',
    );
  });

  it('should throw when the API ID is whitespace only (not silently coerce to 0)', () => {
    vi.mocked(envConfig).telegramApiId = '   ';
    vi.mocked(envConfig).telegramApiHash = 'test-hash';
    vi.mocked(envConfig).telegramSession = 'test-session';

    expect(() => createTelegramClient()).toThrow(
      'Telegram API ID must be a valid integer.',
    );
  });

  it('should throw when the API ID is not a valid integer', () => {
    vi.mocked(envConfig).telegramApiId = 'not-a-number';
    vi.mocked(envConfig).telegramApiHash = 'test-hash';
    vi.mocked(envConfig).telegramSession = 'test-session';

    expect(() => createTelegramClient()).toThrow(
      'Telegram API ID must be a valid integer.',
    );
  });
});

describe('getTelegramClient', () => {
  // biome-ignore lint/suspicious/noExplicitAny: matches the mock-constructor cast pattern below
  let mockClient: any;

  beforeEach(async () => {
    // Clear all mocks and module cache so the module-level singleton resets
    // between tests, matching the getHashnodeClient() test convention.
    vi.clearAllMocks();
    vi.resetModules();

    await import('./client');

    mockClient = { test: 'client' };
    vi.mocked(TelegramClient).mockImplementation(
      class {
        constructor() {
          return mockClient;
        }
      } as unknown as typeof TelegramClient,
    );
    vi.mocked(envConfig).telegramApiId = '123';
    vi.mocked(envConfig).telegramApiHash = 'test-hash';
    vi.mocked(envConfig).telegramSession = 'test-session';
  });

  it('should create a new client instance when none exists', async () => {
    const { getTelegramClient } = await import('./client');
    const client = getTelegramClient();

    expect(TelegramClient).toHaveBeenCalledTimes(1);
    expect(client).toBe(mockClient);
  });

  it('should return the same client instance on repeated calls within a process', async () => {
    const { getTelegramClient } = await import('./client');
    const firstClient = getTelegramClient();
    const secondClient = getTelegramClient();

    expect(TelegramClient).toHaveBeenCalledTimes(1);
    expect(firstClient).toBe(secondClient);
  });
});
