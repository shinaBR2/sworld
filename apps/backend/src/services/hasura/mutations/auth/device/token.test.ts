import { describe, it, expect, vi } from 'vitest';
import { hasuraClient } from 'src/services/hasura/client';
import { getDeviceToken } from './token';

vi.mock('src/services/hasura/client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: { request: mockRequest },
  };
});

describe('getDeviceToken', () => {
  it('should call hasuraClient.request with deviceCode', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      device_requests: [{ id: 'req-1', status: 'pending' }],
    });

    const result = await getDeviceToken('test-device-code');

    expect(hasuraClient.request).toHaveBeenCalledWith(
      expect.stringContaining('query getDeviceToken'),
      { deviceCode: 'test-device-code' },
    );
    expect(result).toEqual({ id: 'req-1', status: 'pending' });
  });

  it('should return null when no device request found', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      device_requests: [],
    });

    const result = await getDeviceToken('non-existent-code');
    expect(result).toBeNull();
  });

  it('should throw on GraphQL error', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(getDeviceToken('test-code')).rejects.toThrow(mockError);
  });
});
