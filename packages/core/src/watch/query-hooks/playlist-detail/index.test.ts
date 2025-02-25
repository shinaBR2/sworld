import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadPlaylistDetail } from './index';
import { useRequest } from '../../../universal/hooks/use-request';
import { MEDIA_TYPES } from '../types';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadPlaylistDetail', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  const mockPlaylistData = {
    id: 'playlist-123',
    title: 'Test Playlist',
    playlist_videos: [
      {
        position: 1,
        video: {
          id: 'video-1',
          title: 'First Video',
          source: 'https://example.com/video1',
          user: { username: 'user1' },
          createdAt: '2023-01-01T00:00:00Z',
          user_video_histories: [],
          description: '',
          thumbnailUrl: '',
          slug: '',
          duration: 0,
        },
      },
      {
        position: 2,
        video: {
          id: 'video-2',
          title: 'Second Video',
          source: 'https://example.com/video2',
          user: { username: 'user2' },
          createdAt: '2023-02-01T00:00:00Z',
          user_video_histories: [],
          description: '',
          thumbnailUrl: '',
          slug: '',
          duration: 0,
        },
      },
    ],
  };

  const expectedTransformedVideos = [
    {
      id: 'video-1',
      type: MEDIA_TYPES.VIDEO,
      title: 'First Video',
      description: '',
      thumbnailUrl: '',
      source: 'https://example.com/video1',
      slug: '',
      duration: 0,
      createdAt: '2023-01-01T00:00:00Z',
      user: { username: 'user1' },
      lastWatchedAt: null,
      progressSeconds: 0,
    },
    {
      id: 'video-2',
      type: MEDIA_TYPES.VIDEO,
      title: 'Second Video',
      description: '',
      thumbnailUrl: '',
      source: 'https://example.com/video2',
      slug: '',
      duration: 0,
      createdAt: '2023-02-01T00:00:00Z',
      user: { username: 'user2' },
      lastWatchedAt: null,
      progressSeconds: 0,
    },
  ];

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest with correct params', () => {
    renderHook(() =>
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['playlist-detail', 'playlist-123'],
      getAccessToken: mockGetAccessToken,
      document: expect.stringContaining('query PlaylistDetail'),
      variables: { id: 'playlist-123' },
    });
  });

  it('should return loading state from useRequest', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      playlist: null,
      isLoading: true,
      error: undefined,
    });
  });

  it('should return data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: {
        playlist_by_pk: mockPlaylistData,
      },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: expectedTransformedVideos,
      playlist: mockPlaylistData,
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
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      playlist: null,
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
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      videos: [],
      playlist: null,
      isLoading: false,
      error: mockError,
    });
  });
});
