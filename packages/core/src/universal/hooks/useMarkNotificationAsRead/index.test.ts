import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutationRequest } from '../useMutation';
import { useMarkNotificationAsRead } from './index';

vi.mock('../useMutation', () => ({
  useMutationRequest: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ data: {} }), // Changed to mutateAsync
  }),
}));

const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

describe('useMarkNotificationAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call markAsRead with correct variables', async () => {
    const { markAsRead } = useMarkNotificationAsRead({
      getAccessToken: mockGetAccessToken,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
    });

    // Changed to direct variable passing
    await markAsRead({ notificationId: 'test-id' });

    expect(useMutationRequest).toHaveBeenCalledWith({
      document: expect.anything(),
      getAccessToken: mockGetAccessToken,
      options: {
        onSuccess: mockOnSuccess,
        onError: expect.any(Function),
      },
    });
  });

  it('should call markAllAsRead with correct variables', async () => {
    const { markAllAsRead } = useMarkNotificationAsRead({
      getAccessToken: mockGetAccessToken,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
    });

    // Changed to direct variable passing
    await markAllAsRead({ ids: ['id1', 'id2'] });

    expect(useMutationRequest).toHaveBeenCalledWith({
      document: expect.anything(),
      getAccessToken: mockGetAccessToken,
      options: {
        onSuccess: mockOnSuccess,
        onError: expect.any(Function),
      },
    });
  });

  it('should trigger onError when mutation fails', async () => {
    const mockError = new Error('Mutation failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a mock implementation that properly connects to the onError callback
    const mockMutateAsync = vi.fn().mockRejectedValueOnce(mockError);
    (useMutationRequest as any).mockImplementationOnce(({ options }) => ({
      mutateAsync: async () => {
        try {
          await mockMutateAsync();
        } catch (error) {
          options.onError(error);
          throw error;
        }
      },
    }));

    const { markAsRead } = useMarkNotificationAsRead({
      getAccessToken: mockGetAccessToken,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
    });

    await expect(() => markAsRead({ notificationId: 'test-id' })).rejects.toThrow('Mutation failed');

    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(consoleSpy).toHaveBeenCalledWith('Mark as read failed:', mockError);

    consoleSpy.mockRestore();
  });
});
