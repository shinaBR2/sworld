import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC, type PropsWithChildren } from 'react';
import { useSharePlaylist } from './';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { SharePlaylistMutation } from '../../../graphql/graphql';

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

describe('useShareVideos', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockVariables = {
    id: 'playlist-1',
    emails: ['user1@example.com', 'user2@example.com'],
  };

  const mockSuccessResponse = {
    update_playlist_by_pk: {
      id: 'playlist-1',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully share videos and call onSuccess', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async variables => {
        const result = mockSuccessResponse;
        await Promise.resolve();
        onSuccess(result, variables, undefined);
        return result;
      }),
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useSharePlaylist({
          getAccessToken: mockGetAccessToken,
          onSuccess,
          onError,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await result.current.mutateAsync(mockVariables);

    expect(onSuccess).toHaveBeenCalledWith(mockSuccessResponse, mockVariables, undefined);
    expect(onError).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should handle errors and call onError', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockError = new Error('Share failed');

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async variables => {
        await Promise.resolve();
        onError(mockError, variables, undefined);
        console.error('Share videos failed:', mockError);
        throw mockError;
      }),
      mutate: vi.fn(),
      isLoading: false,
      isError: true,
      error: mockError,
    });

    const { result } = renderHook(
      () =>
        useSharePlaylist({
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
    expect(mockConsoleError).toHaveBeenCalledWith('Share videos failed:', mockError);
  });

  it('should work without optional callbacks', async () => {
    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockResolvedValue(mockSuccessResponse),
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useSharePlaylist({
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const response = await result.current.mutateAsync(mockVariables);
    expect(response).toEqual(mockSuccessResponse);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should properly type the response data', async () => {
    const onSuccess = vi.fn();
    let capturedData: ShareVideoMutation | null = null;

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async variables => {
        const result = mockSuccessResponse;
        await Promise.resolve();
        expect(result.update_playlist_by_pk.id).toBeDefined();
        capturedData = result;
        onSuccess(result);
        return result;
      }),
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useSharePlaylist({
          getAccessToken: mockGetAccessToken,
          onSuccess: (data: SharePlaylistMutation) => {
            onSuccess(data);
          },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await result.current.mutateAsync(mockVariables);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(capturedData).toBeDefined();
  });

  it('should pass the correct mutation document', () => {
    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn(),
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });

    renderHook(
      () =>
        useSharePlaylist({
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(useMutationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        document: expect.stringContaining('mutation sharePlaylist($id: uuid!, $emails: jsonb)'),
      })
    );
  });
});
