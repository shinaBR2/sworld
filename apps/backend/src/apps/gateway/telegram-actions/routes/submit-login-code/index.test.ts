import {
  TelegramCodeExpiredError,
  TelegramInvalidCodeError,
  TelegramLoginNotStartedError,
} from 'src/services/telegram/errors';
import { submitLoginCode } from 'src/services/telegram/login';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitTelegramLoginCode } from './index';

const call = (context: unknown) =>
  submitTelegramLoginCode(context as any) as Promise<{
    success: boolean;
    message: string;
  }>;

vi.mock('src/services/telegram/login', () => ({
  submitLoginCode: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const ctx = (code = '12345', userId = USER_ID) => ({
  validatedData: { code, userId },
});

describe('submitTelegramLoginCode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('completes login for the session user with the submitted code', async () => {
    vi.mocked(submitLoginCode).mockResolvedValue(undefined);

    const result = await call(ctx('99887'));

    expect(submitLoginCode).toHaveBeenCalledWith(USER_ID, '99887');
    expect(result.success).toBe(true);
  });

  it('maps a wrong code to INVALID_CODE (re-promptable)', async () => {
    vi.mocked(submitLoginCode).mockRejectedValue(
      new TelegramInvalidCodeError(USER_ID),
    );

    const result = await call(ctx());

    expect(result.success).toBe(false);
    expect(result.message).toBe('INVALID_CODE');
  });

  it('maps an aged-out code to CODE_EXPIRED', async () => {
    vi.mocked(submitLoginCode).mockRejectedValue(
      new TelegramCodeExpiredError(USER_ID),
    );

    expect((await call(ctx())).message).toBe('CODE_EXPIRED');
  });

  it('maps submit-before-request to LOGIN_NOT_STARTED', async () => {
    vi.mocked(submitLoginCode).mockRejectedValue(
      new TelegramLoginNotStartedError(USER_ID),
    );

    expect((await call(ctx())).message).toBe('LOGIN_NOT_STARTED');
  });

  it('returns a generic failure for an unexpected error', async () => {
    vi.mocked(submitLoginCode).mockRejectedValue(new Error('boom'));

    expect((await call(ctx())).message).toBe('Failed to submit login code');
  });
});
