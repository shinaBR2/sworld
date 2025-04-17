import { renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import { useCreateJournal, useDeleteJournal } from './index';

// Mock dependencies
vi.mock('../../providers/auth');
vi.mock('../../providers/query');
vi.mock('../../universal/hooks/useMutation');

const mockAccessToken = vi.fn();
const mockInvalidateQuery = vi.fn();

// Spy on console.error to silence it during tests
const originalConsoleError = console.error;
console.error = vi.fn();

describe('Journal Mutation Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({ getAccessToken: mockAccessToken });
    vi.mocked(useQueryContext).mockReturnValue({ invalidateQuery: mockInvalidateQuery });
    vi.mocked(useMutationRequest).mockReturnValue({ mutateAsync: vi.fn() });
  });

  afterAll(() => {
    // Restore original console.error after tests
    console.error = originalConsoleError;
  });

  describe('useCreateJournal', () => {
    it('should create journal and invalidate query', () => {
      const mockOnSuccess = vi.fn();
      renderHook(() => useCreateJournal({ onSuccess: mockOnSuccess }));

      // Get the onSuccess callback from the mutation options
      const mutationOptions = vi.mocked(useMutationRequest).mock.calls[0][0].options;
      const onSuccessCallback = mutationOptions?.onSuccess;

      // Mock data with date
      const mockData = {
        insert_journals_one: {
          id: '1',
          date: '2023-02-15',
        },
      };

      // Call the onSuccess callback directly
      onSuccessCallback?.(mockData);

      // Verify invalidation using date from returned data
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['journals', 2, 2023]);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  describe('useDeleteJournal', () => {
    it('should delete journal and invalidate query', () => {
      const mockOnSuccess = vi.fn();
      renderHook(() => useDeleteJournal({ onSuccess: mockOnSuccess }));

      // Get the onSuccess callback from the mutation options
      const mutationOptions = vi.mocked(useMutationRequest).mock.calls[0][0].options;
      const onSuccessCallback = mutationOptions?.onSuccess;

      // Mock data with date
      const mockData = {
        delete_journals_by_pk: {
          id: '1',
          date: '2023-03-20',
        },
      };

      // Call the onSuccess callback directly
      onSuccessCallback?.(mockData);

      // Verify invalidation using date from returned data
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['journals', 3, 2023]);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['journal', '1']);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', () => {
      const mockOnError = vi.fn();
      renderHook(() => useDeleteJournal({ onError: mockOnError }));

      // Get the onError callback from the mutation options
      const mutationOptions = vi.mocked(useMutationRequest).mock.calls[0][0].options;
      const onErrorCallback = mutationOptions?.onError;

      // Create a mock error
      const mockError = new Error('Failed');

      // Call the onError callback directly
      onErrorCallback?.(mockError);

      // Verify error handler was called
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });
});
