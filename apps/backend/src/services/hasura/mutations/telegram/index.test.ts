import { ClientError } from 'graphql-request';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { saveTelegramPendingLogin, saveTelegramSession } from './index';

vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('saveTelegramPendingLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the intermediate session + phone_code_hash and returns affected_rows', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_telegram_credentials: { affected_rows: 1 },
    });

    const affected = await saveTelegramPendingLogin({
      userId: 'user-1',
      pendingSessionString: 'intermediate-session',
      phoneCodeHash: 'hash-abc',
    });

    expect(affected).toBe(1);
    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation SaveTelegramPendingLogin'),
      variables: {
        userId: 'user-1',
        pendingSessionString: 'intermediate-session',
        phoneCodeHash: 'hash-abc',
      },
    });
  });

  it('returns 0 affected_rows when no row exists for the user', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_telegram_credentials: { affected_rows: 0 },
    });

    const affected = await saveTelegramPendingLogin({
      userId: 'ghost',
      pendingSessionString: 's',
      phoneCodeHash: 'h',
    });

    expect(affected).toBe(0);
  });
});

describe('saveTelegramSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the authorized session (clearing the pending hash) and returns affected_rows', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_telegram_credentials: { affected_rows: 1 },
    });

    const affected = await saveTelegramSession({
      userId: 'user-1',
      sessionString: 'authorized-session',
    });

    expect(affected).toBe(1);
    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation SaveTelegramSession'),
      variables: { userId: 'user-1', sessionString: 'authorized-session' },
    });
  });

  it('returns 0 affected_rows when no row exists for the user', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_telegram_credentials: { affected_rows: 0 },
    });

    const affected = await saveTelegramSession({
      userId: 'ghost',
      sessionString: 's',
    });

    expect(affected).toBe(0);
  });

  it('never lets the session string escape in a request-failure error', async () => {
    // graphql-request's ClientError embeds the request variables (the
    // session secret) in its message; the mutation must redact it so it can't
    // reach logs via withRetry / an error cause.
    const secret = '1AgSECRETauthorizedSession';
    const clientError = new ClientError(
      { errors: [{ message: 'permission denied' }], status: 400 } as never,
      {
        query: 'mutation SaveTelegramSession { ... }',
        variables: { userId: 'user-1', sessionString: secret },
      },
    );
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(clientError);

    let thrown: unknown;
    try {
      await saveTelegramSession({ userId: 'user-1', sessionString: secret });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).not.toContain(secret);
    expect((thrown as Error).cause).toBeUndefined();
  });
});
