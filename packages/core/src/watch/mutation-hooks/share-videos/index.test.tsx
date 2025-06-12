import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC, type PropsWithChildren } from 'react';
import { useSharePlaylist, useShareVideo } from '.';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

// Mock useMutationRequest
vi.mock('../../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));

// Mock console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe('share hooks', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockEmails = ['user1@example.com', 'user2@example.com'];

  const testCases = [
    {
      name: 'useSharePlaylist',
      hook: useSharePlaylist,
      mockId: 'playlist-1',
      successResponse: {
        update_playlist_by_pk: { id: 'playlist-1' },
      },
      mutationName: 'sharePlaylist',
      errorPrefix: 'Share playlist failed:',
    },
    {
      name: 'useShareVideo',
      hook: useShareVideo,
      mockId: 'video-1',
      successResponse: {
        update_videos_by_pk: { id: 'video-1' },
      },
      mutationName: 'shareVideo',
      errorPrefix: 'Share video failed:',
    },
  ] as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  testCases.forEach(testCase => {
    describe(testCase.name, () => {
      const mockVariables = {
        id: testCase.mockId,
        emails: mockEmails,
      };

      it('should successfully share and call onSuccess', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        vi.mocked(useMutationRequest).mockReturnValueOnce({
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockImplementation(async variables => {
            const result = testCase.successResponse;
            await Promise.resolve();
            onSuccess(result, variables, undefined);
            return result;
          }),
          data: undefined,
          error: null,
          failureCount: 0,
          failureReason: null,
          isError: false,
          isIdle: true,

          isPending: false,
          isPaused: false,
          isSuccess: false,
          reset: vi.fn(),
          status: 'idle',
          submittedAt: 0,
          variables: {} as any,
          context: undefined,
        });

        const { result } = renderHook(
          () =>
            testCase.hook({
              getAccessToken: mockGetAccessToken,
              onSuccess,
              onError,
            }),
          {
            wrapper: createWrapper(),
          }
        );

        await result.current.mutateAsync(mockVariables);

        expect(onSuccess).toHaveBeenCalledWith(testCase.successResponse, mockVariables, undefined);
        expect(onError).not.toHaveBeenCalled();
        expect(mockConsoleError).not.toHaveBeenCalled();
      });

      it('should handle errors and call onError', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const mockError = new Error('Share failed');

        vi.mocked(useMutationRequest).mockReturnValueOnce({
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockImplementation(async variables => {
            await Promise.resolve();
            onError(mockError, variables, undefined);
            console.error(testCase.errorPrefix, mockError);
            throw mockError;
          }),
          data: undefined,
          error: mockError,
          failureCount: 1,
          failureReason: mockError,
          isError: true,
          isIdle: false,

          isPending: false,
          isPaused: false,
          isSuccess: false,
          reset: vi.fn(),
          status: 'error',
          submittedAt: 0,
          variables: {} as any,
          context: undefined,
        });

        const { result } = renderHook(
          () =>
            testCase.hook({
              getAccessToken: mockGetAccessToken,
              onSuccess,
              onError,
            }),
          {
            wrapper: createWrapper(),
          }
        );

        await expect(result.current.mutateAsync(mockVariables)).rejects.toThrow('Share failed');

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(mockError, mockVariables, undefined);
        expect(mockConsoleError).toHaveBeenCalledWith(testCase.errorPrefix, mockError);
      });

      it('should work without optional callbacks', async () => {
        vi.mocked(useMutationRequest).mockReturnValueOnce({
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockResolvedValue(testCase.successResponse),
          data: undefined,
          error: null,
          failureCount: 0,
          failureReason: null,
          isError: false,
          isIdle: true,

          isPending: false,
          isPaused: false,
          isSuccess: false,
          reset: vi.fn(),
          status: 'idle',
          submittedAt: 0,
          variables: {} as any,
          context: undefined,
        });

        const { result } = renderHook(
          () =>
            testCase.hook({
              getAccessToken: mockGetAccessToken,
            }),
          {
            wrapper: createWrapper(),
          }
        );

        const response = await result.current.mutateAsync(mockVariables);
        expect(response).toEqual(testCase.successResponse);
        expect(mockConsoleError).not.toHaveBeenCalled();
      });

      it('should pass the correct mutation document', () => {
        vi.mocked(useMutationRequest).mockReturnValueOnce({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          data: undefined,
          error: null,
          failureCount: 0,
          failureReason: null,
          isError: false,
          isIdle: true,

          isPending: false,
          isPaused: false,
          isSuccess: false,
          reset: vi.fn(),
          status: 'idle',
          submittedAt: 0,
          variables: {} as any,
          context: undefined,
        });

        renderHook(
          () =>
            testCase.hook({
              getAccessToken: mockGetAccessToken,
            }),
          {
            wrapper: createWrapper(),
          }
        );

        expect(useMutationRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            document: expect.stringContaining(`mutation ${testCase.mutationName}($id: uuid!, $emails: jsonb)`),
          })
        );
      });
    });
  });
});
