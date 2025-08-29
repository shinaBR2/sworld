import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import {
  useDeleteFinanceTransaction,
  useInsertFinanceTransaction,
  useUpdateFinanceTransaction,
} from './index';

// Mock the useMutationRequest hook
vi.mock('../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));

describe('Finance Mutation Hooks', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutationRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  describe('useInsertFinanceTransaction', () => {
    it('should call useMutationRequest with correct parameters', () => {
      const insertFinanceRecord = useInsertFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      expect(useMutationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.anything(),
          getAccessToken: mockGetAccessToken,
          options: expect.objectContaining({
            onSuccess: mockOnSuccess,
          }),
        }),
      );
      expect(insertFinanceRecord).toBe(mockMutateAsync);
    });

    it('should handle errors correctly', () => {
      useInsertFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      // Extract the error handler
      const errorHandler =
        vi.mocked(useMutationRequest).mock.calls[0][0].options.onError;
      const mockError = new Error('Test error');

      // Call the error handler
      errorHandler(mockError);

      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('useUpdateFinanceTransaction', () => {
    it('should call useMutationRequest with correct parameters', () => {
      const updateFinanceRecord = useUpdateFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      expect(useMutationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.anything(),
          getAccessToken: mockGetAccessToken,
          options: expect.objectContaining({
            onSuccess: mockOnSuccess,
          }),
        }),
      );
      expect(updateFinanceRecord).toBe(mockMutateAsync);
    });

    it('should handle errors correctly', () => {
      useUpdateFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      // Extract the error handler
      const errorHandler =
        vi.mocked(useMutationRequest).mock.calls[0][0].options.onError;
      const mockError = new Error('Test error');

      // Call the error handler
      errorHandler(mockError);

      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('useDeleteFinanceTransaction', () => {
    it('should call useMutationRequest with correct parameters', () => {
      const deleteFinanceRecord = useDeleteFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      expect(useMutationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.anything(),
          getAccessToken: mockGetAccessToken,
          options: expect.objectContaining({
            onSuccess: mockOnSuccess,
          }),
        }),
      );
      expect(deleteFinanceRecord).toBe(mockMutateAsync);
    });

    it('should handle errors correctly', () => {
      useDeleteFinanceTransaction({
        getAccessToken: mockGetAccessToken,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });

      // Extract the error handler
      const errorHandler =
        vi.mocked(useMutationRequest).mock.calls[0][0].options.onError;
      const mockError = new Error('Test error');

      // Call the error handler
      errorHandler(mockError);

      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should handle case when onError is not provided', () => {
    // Test with no onError callback
    useInsertFinanceTransaction({
      getAccessToken: mockGetAccessToken,
      onSuccess: mockOnSuccess,
    });

    // Extract the error handler
    const errorHandler =
      vi.mocked(useMutationRequest).mock.calls[0][0].options.onError;
    const mockError = new Error('Test error');

    // This should not throw
    expect(() => errorHandler(mockError)).not.toThrow();
  });
});
