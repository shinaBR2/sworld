import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadVideos } from '.';
import { useRequest } from '../../../universal/hooks/use-request';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    error: undefined,
  }),
}));

describe('useLoadVideos', () => {
  const mockGetAccessToken = vi.fn();

  const mockVideos = [
    {
      id: '1',
      title: 'Video 1',
      description: 'Description 1',
      thumbnailUrl: 'thumb1.jpg',
      source: 'source1',
      slug: 'video-1',
      createdAt: '2024-01-01',
      user: { username: 'user1' },
      user_video_histories: [{ last_watched_at: '2024-01-02', progress_seconds: 30 }],
    },
    {
      id: '2',
      title: 'Video 2',
      description: 'Description 2',
      thumbnailUrl: 'thumb2.jpg',
      source: 'source2',
      slug: 'video-2',
      createdAt: '2024-01-01',
      user: { username: 'user2' },
      user_video_histories: [],
    },
  ];

  const expectedTransformedVideos = [
    {
      id: '1',
      title: 'Video 1',
      description: 'Description 1',
      thumbnailUrl: 'thumb1.jpg',
      source: 'source1',
      slug: 'video-1',
      createdAt: '2024-01-01',
      user: { username: 'user1' },
      lastWatchedAt: '2024-01-02',
      progressSeconds: 30,
    },
    {
      id: '2',
      title: 'Video 2',
      description: 'Description 2',
      thumbnailUrl: 'thumb2.jpg',
      source: 'source2',
      slug: 'video-2',
      createdAt: '2024-01-01',
      user: { username: 'user2' },
      lastWatchedAt: null,
      progressSeconds: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('test-token');
  });

  it('should set up useRequest with correct params', () => {
    renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['videos'],
      getAccessToken: mockGetAccessToken,
      document: expect.stringContaining('query AllVideos'),
    });
  });

  it('should return loading state', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }));

    expect(result.current).toEqual({
      videos: [],
      isLoading: true,
    });
  });

  it('should return transformed data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { videos: mockVideos },
      isLoading: false,
    });

    const { result } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }));

    expect(result.current).toEqual({
      videos: expectedTransformedVideos,
      isLoading: false,
    });
  });

  it('should handle error', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }));

    expect(result.current).toEqual({
      videos: [],
      isLoading: false,
      error: mockError,
    });
  });
});
