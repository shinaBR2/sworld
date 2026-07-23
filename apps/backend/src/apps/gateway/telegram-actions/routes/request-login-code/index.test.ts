import {
  TelegramMisconfiguredError,
  TelegramNotProvisionedError,
} from 'src/services/telegram/errors';
import { requestLoginCode } from 'src/services/telegram/login';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestTelegramLoginCode } from './index';

const call = (context: unknown) =>
  requestTelegramLoginCode(context as any) as Promise<{
    success: boolean;
    message: string;
  }>;

vi.mock('src/services/telegram/login', () => ({
  requestLoginCode: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const ctx = (userId = USER_ID) => ({ validatedData: { userId } });

describe('requestTelegramLoginCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests a login code for the session user and reports success', async () => {
    vi.mocked(requestLoginCode).mockResolvedValue(undefined);

    const result = await call(ctx());

    expect(requestLoginCode).toHaveBeenCalledWith(USER_ID);
    expect(result.success).toBe(true);
  });

  it('maps a missing credentials row to NOT_PROVISIONED', async () => {
    vi.mocked(requestLoginCode).mockRejectedValue(
      new TelegramNotProvisionedError(USER_ID),
    );

    const result = await call(ctx());

    expect(result.success).toBe(false);
    expect(result.message).toBe('NOT_PROVISIONED');
  });

  it('maps a malformed row to MISCONFIGURED', async () => {
    vi.mocked(requestLoginCode).mockRejectedValue(
      new TelegramMisconfiguredError(USER_ID),
    );

    const result = await call(ctx());

    expect(result.message).toBe('MISCONFIGURED');
  });

  it('returns a generic failure for an unexpected error', async () => {
    vi.mocked(requestLoginCode).mockRejectedValue(new Error('boom'));

    const result = await call(ctx());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to request login code');
  });
});
