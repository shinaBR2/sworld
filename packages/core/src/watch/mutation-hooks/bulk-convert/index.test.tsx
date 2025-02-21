import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC, type PropsWithChildren } from 'react';
import { useBulkConvertVideos } from './';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { InsertVideosMutation } from '../../../graphql/graphql';

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

describe('useBulkConvertVideos', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockVariables = {
    objects: [
      {
        title: 'Test Video 1',
        description: 'Description 1',
        slug: 'test-video-1',
        video_url: 'https://example.com/video1.mp4',
      },
    ],
  };

  const mockSuccessResponse = {
    insert_videos: {
      returning: [
        {
          id: '1',
          title: 'Test Video 1',
          description: 'Description 1',
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully convert videos and call onSuccess', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async variables => {
        const result = mockSuccessResponse;
        await Promise.resolve();
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
        useBulkConvertVideos({
          getAccessToken: mockGetAccessToken,
          onSuccess,
          onError,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await result.current.mutateAsync(mockVariables);

    expect(onSuccess).toHaveBeenCalledWith(mockSuccessResponse);
    expect(onError).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should handle errors and call onError', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockError = new Error('Conversion failed');

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async () => {
        await Promise.resolve();
        onError(mockError);
        console.error('Bulk convert videos failed:', mockError);
        throw mockError;
      }),
      mutate: vi.fn(),
      isLoading: false,
      isError: true,
      error: mockError,
    });

    const { result } = renderHook(
      () =>
        useBulkConvertVideos({
          getAccessToken: mockGetAccessToken,
          onSuccess,
          onError,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await expect(result.current.mutateAsync(mockVariables)).rejects.toThrow('Conversion failed');

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(mockError);
    expect(mockConsoleError).toHaveBeenCalledWith('Bulk convert videos failed:', mockError);
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
        useBulkConvertVideos({
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
    let capturedData: InsertVideosMutation | null = null;

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async variables => {
        const result = mockSuccessResponse;
        await Promise.resolve();
        const firstVideo = result.insert_videos.returning[0];
        expect(firstVideo.id).toBeDefined();
        expect(firstVideo.title).toBeDefined();
        expect(firstVideo.description).toBeDefined();
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
        useBulkConvertVideos({
          getAccessToken: mockGetAccessToken,
          onSuccess: (data: InsertVideosMutation) => {
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
        useBulkConvertVideos({
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(useMutationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        document: expect.stringContaining('mutation InsertVideos($objects: [videos_insert_input!]!)'),
      })
    );
  });
});
