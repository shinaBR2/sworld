import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { getTelegramCredentialsByUserId } from './index';

vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

const row = {
  phoneNumber: '+15551234567',
  apiId: '123',
  apiHash: 'hash-1',
  sessionString: 'session-1',
  pendingSessionString: null,
  pendingPhoneCodeHash: null,
};

describe('getTelegramCredentialsByUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the single matching credentials row', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      telegram_credentials: [row],
    });

    const result = await getTelegramCredentialsByUserId('user-1');

    expect(result).toEqual(row);
    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('query GetTelegramCredentialsByUserId'),
      variables: { userId: 'user-1' },
    });
  });

  it('returns null when the user has no credentials row', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      telegram_credentials: [],
    });

    const result = await getTelegramCredentialsByUserId('user-2');

    expect(result).toBeNull();
  });
});
