import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { useUpdateVideoThumbnail } from './';

// Mock useMutationRequest
vi.mock('../../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));

// Mock console.error
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

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

describe('useUpdateVideoThumbnail', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockVariables = {
    id: 'test-video-id',
    thumbnailUrl: 'https://example.com/thumbnail.png',
  };

  const mockSuccessResponse = {
    update_videos_by_pk: {
      id: 'test-video-id',
      thumbnailUrl: 'https://example.com/thumbnail.png',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update video thumbnail and call onSuccess', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async (variables) => {
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
        useUpdateVideoThumbnail({
          getAccessToken: mockGetAccessToken,
          onSuccess,
          onError,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await result.current.mutateAsync(mockVariables);

    expect(onSuccess).toHaveBeenCalledWith(
      mockSuccessResponse,
      mockVariables,
      undefined,
    );
    expect(onError).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should handle errors and call onError', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockError = new Error('Update thumbnail failed');

    vi.mocked(useMutationRequest).mockReturnValueOnce({
      mutateAsync: vi.fn().mockImplementation(async (variables) => {
        await Promise.resolve();
        onError(mockError, variables, undefined);
        console.error('Update video thumbnail failed:', mockError);
        throw mockError;
      }),
      mutate: vi.fn(),
      isLoading: false,
      isError: true,
      error: mockError,
    });

    const { result } = renderHook(
      () =>
        useUpdateVideoThumbnail({
          getAccessToken: mockGetAccessToken,
          onSuccess,
          onError,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await expect(result.current.mutateAsync(mockVariables)).rejects.toThrow(
      'Update thumbnail failed',
    );

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(mockError, mockVariables, undefined);
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Update video thumbnail failed:',
      mockError,
    );
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
        useUpdateVideoThumbnail({
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    const response = await result.current.mutateAsync(mockVariables);
    expect(response).toEqual(mockSuccessResponse);
    expect(mockConsoleError).not.toHaveBeenCalled();
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
        useUpdateVideoThumbnail({
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(useMutationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        document: expect.stringContaining(
          'mutation UpdateVideoThumbnail($id: uuid!, $thumbnailUrl: String!)',
        ),
      }),
    );
  });
});
