import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../../universal/hooks/use-request';
import { useLoadVideos } from '.';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
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
      user_video_histories: [
        { last_watched_at: '2024-01-02', progress_seconds: 30 },
      ],
    },
    {
      id: '2',
      title: 'Video 2',
      description: 'Description 2',
      thumbnailUrl: 'thumb2.jpg',
      source: 'source2',
      slug: 'video-2',
      createdAt: '2024-01-02',
      user: { username: 'user2' },
      user_video_histories: [],
    },
  ];

  const expectedTransformedVideos = [
    {
      id: '2',
      title: 'Video 2',
      description: 'Description 2',
      thumbnailUrl: 'thumb2.jpg',
      source: 'source2',
      slug: 'video-2',
      createdAt: '2024-01-02',
      user: { username: 'user2' },
      lastWatchedAt: null,
      progressSeconds: 0,
      duration: 0,
      type: 'video',
    },
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
      duration: 0,
      type: 'video',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('test-token');
  });

  it('should set up useRequest with correct params', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
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
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadVideos({ getAccessToken: mockGetAccessToken }),
    );

    expect(result.current).toEqual({
      videos: [],
      isLoading: true,
    });
  });

  it('should return transformed and sorted data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: {
        videos: mockVideos,
        playlist: [
          {
            id: '3',
            title: 'Playlist 1',
            description: '',
            thumbnailUrl: 'thumb3.jpg',
            slug: 'playlist-1',
            createdAt: '2024-01-03', // Most recent date
            user: { username: 'user3' },
            playlist_videos: [
              {
                video: mockVideos[0],
                order: 1,
              },
            ],
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadVideos({ getAccessToken: mockGetAccessToken }),
    );

    expect(result.current).toEqual({
      videos: [
        {
          id: '3',
          type: 'playlist',
          title: 'Playlist 1',
          description: '',
          thumbnailUrl: 'thumb3.jpg',
          slug: 'playlist-1',
          createdAt: '2024-01-03', // Most recent date
          user: { username: 'user3' },
          firstVideoId: '1',
        },
        ...expectedTransformedVideos,
      ],
      isLoading: false,
    });

    expect(result.current.videos[0].createdAt).toBe('2024-01-03');
    expect(result.current.videos[1].createdAt).toBe('2024-01-02');
    expect(result.current.videos[2].createdAt).toBe('2024-01-01');
  });

  it('should handle error', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadVideos({ getAccessToken: mockGetAccessToken }),
    );

    expect(result.current).toEqual({
      videos: [],
      isLoading: false,
      error: mockError,
    });
  });
});
