import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import {
  useLoadPlaylistDetail,
  useLoadPublicPlaylistDetail,
} from './playlist-detail';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadPlaylistDetail', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  // Intentionally out of order to assert the transform sorts by position.
  const mockPlaylistData = {
    id: 'playlist-123',
    title: 'Chill',
    thumbnailUrl: '',
    slug: 'chill',
    createdAt: '2024-01-01T00:00:00Z',
    description: '',
    playlist_audios: [
      {
        position: 2,
        audio: {
          id: 'audio-2',
          name: 'Second',
          source: 'https://example.com/2.mp3',
          thumbnailUrl: '',
          artistName: 'Artist 2',
          createdAt: '2024-02-01T00:00:00Z',
        },
      },
      {
        position: 1,
        audio: {
          id: 'audio-1',
          name: 'First',
          source: 'https://example.com/1.mp3',
          thumbnailUrl: 'thumb1.jpg',
          artistName: 'Artist 1',
          createdAt: '2024-01-15T00:00:00Z',
        },
      },
    ],
  };

  const expectedAudios = [
    {
      id: 'audio-1',
      name: 'First',
      source: 'https://example.com/1.mp3',
      thumbnailUrl: 'thumb1.jpg',
      artistName: 'Artist 1',
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'audio-2',
      name: 'Second',
      source: 'https://example.com/2.mp3',
      thumbnailUrl: '',
      artistName: 'Artist 2',
      createdAt: '2024-02-01T00:00:00Z',
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
      }),
    );

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlist-detail', 'playlist-123'],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
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
      }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: true,
      error: undefined,
    });
  });

  it('should return audios ordered by position when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: mockPlaylistData },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      }),
    );

    expect(result.current).toEqual({
      audios: expectedAudios,
      playlist: mockPlaylistData,
      isLoading: false,
      error: undefined,
    });
  });

  it('should return an empty audios list for an empty playlist', () => {
    const emptyPlaylist = { ...mockPlaylistData, playlist_audios: [] };
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: emptyPlaylist },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({
        id: 'playlist-123',
        getAccessToken: mockGetAccessToken,
      }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: emptyPlaylist,
      isLoading: false,
      error: undefined,
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
      }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: false,
      error: mockError,
    });
  });
});

describe('useLoadPublicPlaylistDetail', () => {
  const mockPlaylistData = {
    id: 'playlist-123',
    title: 'Chill',
    thumbnailUrl: '',
    slug: 'chill',
    createdAt: '2024-01-01T00:00:00Z',
    description: '',
    playlist_audios: [
      {
        position: 1,
        audio: {
          id: 'audio-1',
          name: 'First',
          source: 'https://example.com/1.mp3',
          thumbnailUrl: 'thumb1.jpg',
          artistName: 'Artist 1',
          createdAt: '2024-01-15T00:00:00Z',
        },
      },
    ],
  };

  const expectedAudios = [
    {
      id: 'audio-1',
      name: 'First',
      source: 'https://example.com/1.mp3',
      thumbnailUrl: 'thumb1.jpg',
      artistName: 'Artist 1',
      createdAt: '2024-01-15T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest without an access token', () => {
    renderHook(() => useLoadPublicPlaylistDetail({ id: 'playlist-123' }));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-public-playlist-detail', 'playlist-123'],
      document: expect.anything(),
      variables: { id: 'playlist-123' },
    });
  });

  it('should return audios when a public playlist is loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: mockPlaylistData },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPublicPlaylistDetail({ id: 'playlist-123' }),
    );

    expect(result.current).toEqual({
      audios: expectedAudios,
      playlist: mockPlaylistData,
      isLoading: false,
      error: undefined,
    });
  });

  it('should return a graceful empty state for a private/nonexistent id', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: null },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPublicPlaylistDetail({ id: 'missing' }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: false,
      error: undefined,
    });
  });
});
