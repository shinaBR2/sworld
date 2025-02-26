import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadHistory } from './index';
import { useRequest } from '../../../universal/hooks/use-request';
import { MEDIA_TYPES } from '../types';
import { UserVideoHistoryQuery } from '../../../graphql/graphql';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadHistory', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  const mockHistoryData: UserVideoHistoryQuery = {
    user_video_history: [
      {
        id: 'history-1',
        last_watched_at: '2023-01-15T10:30:00Z',
        progress_seconds: 120,
        video: {
          id: 'video-1',
          title: 'First Video',
          slug: 'first-video',
          thumbnailUrl: 'https://example.com/thumb1.jpg',
          duration: 300,
          createdAt: '2023-01-01T00:00:00Z',
          user: {
            username: 'user1',
          },
          playlist_videos: [
            {
              playlist: {
                id: 'playlist-1',
                slug: 'main-playlist',
                title: 'Main Playlist',
                thumbnailUrl: 'https://example.com/playlist1.jpg',
              },
            },
          ],
        },
      },
      {
        id: 'history-2',
        last_watched_at: '2023-01-20T14:45:00Z',
        progress_seconds: 180,
        video: {
          id: 'video-2',
          title: 'Second Video',
          slug: 'second-video',
          thumbnailUrl: 'https://example.com/thumb2.jpg',
          duration: 450,
          createdAt: '2023-01-10T00:00:00Z',
          user: {
            username: 'user2',
          },
          playlist_videos: [
            {
              playlist: {
                id: 'playlist-2',
                slug: 'another-playlist',
                title: 'Another Playlist',
                thumbnailUrl: 'https://example.com/playlist2.jpg',
              },
            },
          ],
        },
      },
    ],
  };

  const expectedTransformedVideos = [
    {
      id: 'video-1',
      type: MEDIA_TYPES.VIDEO,
      title: 'First Video',
      slug: 'first-video',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: 300,
      createdAt: '2023-01-01T00:00:00Z',
      lastWatchedAt: '2023-01-15T10:30:00Z',
      progressSeconds: 120,
      playlist: {
        id: 'playlist-1',
        slug: 'main-playlist',
        title: 'Main Playlist',
        thumbnailUrl: 'https://example.com/playlist1.jpg',
      },
      user: {
        username: 'user1',
      },
    },
    {
      id: 'video-2',
      type: MEDIA_TYPES.VIDEO,
      title: 'Second Video',
      slug: 'second-video',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      duration: 450,
      createdAt: '2023-01-10T00:00:00Z',
      lastWatchedAt: '2023-01-20T14:45:00Z',
      progressSeconds: 180,
      playlist: {
        id: 'playlist-2',
        slug: 'another-playlist',
        title: 'Another Playlist',
        thumbnailUrl: 'https://example.com/playlist2.jpg',
      },
      user: {
        username: 'user2',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest with correct params', () => {
    renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['history'],
      getAccessToken: mockGetAccessToken,
      document: expect.stringContaining('query UserVideoHistory'),
    });
  });

  it('should return loading state from useRequest', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      isLoading: true,
      error: undefined,
    });
  });

  it('should return transformed data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: mockHistoryData,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: expectedTransformedVideos,
      isLoading: false,
      error: undefined,
    });
  });

  it('should handle null response data', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      isLoading: false,
    });
  });

  it('should handle error from useRequest', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      isLoading: false,
      error: mockError,
    });
  });

  it('should handle video without thumbnailUrl', () => {
    const dataWithMissingFields = {
      user_video_history: [
        {
          ...mockHistoryData.user_video_history[0],
          video: {
            ...mockHistoryData.user_video_history[0].video,
            thumbnailUrl: null,
          },
        },
      ],
    };

    vi.mocked(useRequest).mockReturnValue({
      data: dataWithMissingFields,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current.videos[0].thumbnailUrl).toBe('');
  });

  it('should handle video without duration', () => {
    const dataWithMissingFields = {
      user_video_history: [
        {
          ...mockHistoryData.user_video_history[0],
          video: {
            ...mockHistoryData.user_video_history[0].video,
            duration: null,
          },
        },
      ],
    };

    vi.mocked(useRequest).mockReturnValue({
      data: dataWithMissingFields,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadHistory({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current.videos[0].duration).toBe(0);
  });
});
