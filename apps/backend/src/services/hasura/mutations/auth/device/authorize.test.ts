import { describe, it, expect, vi } from 'vitest';
import { hasuraClient } from 'src/services/hasura/client';
import { authorizeDevice } from './authorize';

vi.mock('src/services/hasura/client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: { request: mockRequest },
  };
});

describe('authorizeDevice', () => {
  const mockInput = {
    userCode: 'ABC-123',
    approved: true,
    userId: 'user-123',
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_device_requests: { affected_rows: 1 },
    });

    await authorizeDevice(mockInput);

    expect(hasuraClient.request).toHaveBeenCalledWith(
      expect.stringContaining('mutation authorizeDevice'),
      expect.objectContaining({
        where: expect.objectContaining({
          userCode: { _eq: mockInput.userCode },
        }),
        _set: expect.objectContaining({
          status: 'authorized',
          user_id: mockInput.userId,
        }),
      }),
    );
  });

  it('should set denied status when approved is false', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_device_requests: { affected_rows: 1 },
    });

    await authorizeDevice({ ...mockInput, approved: false });

    expect(hasuraClient.request).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        _set: expect.objectContaining({
          status: 'denied',
          user_id: null,
        }),
      }),
    );
  });

  it('should throw on GraphQL error', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(authorizeDevice(mockInput)).rejects.toThrow(mockError);
  });
});
