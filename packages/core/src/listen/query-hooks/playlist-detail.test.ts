import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadPlaylistDetail } from './playlist-detail';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

vi.mock('../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

const setSignedIn = (isSignedIn: boolean) => {
  vi.mocked(useAuthContext).mockReturnValue({
    isSignedIn,
    getAccessToken: mockGetAccessToken,
  } as unknown as ReturnType<typeof useAuthContext>);
};

describe('useLoadPlaylistDetail', () => {
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
    },
    {
      id: 'audio-2',
      name: 'Second',
      source: 'https://example.com/2.mp3',
      thumbnailUrl: '',
      artistName: 'Artist 2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('mock-token');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('attaches the token and role-scoped key when signed in', () => {
    setSignedIn(true);

    renderHook(() => useLoadPlaylistDetail({ id: 'playlist-123' }));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlist-detail', true, 'playlist-123'],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
      variables: { id: 'playlist-123' },
    });
  });

  it('omits the token when anonymous so Hasura runs the anonymous role', () => {
    setSignedIn(false);

    renderHook(() => useLoadPlaylistDetail({ id: 'playlist-123' }));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlist-detail', false, 'playlist-123'],
      getAccessToken: undefined,
      document: expect.anything(),
      variables: { id: 'playlist-123' },
    });
  });

  it('returns loading state from useRequest', () => {
    setSignedIn(false);
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({ id: 'playlist-123' }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: true,
      error: undefined,
    });
  });

  it('returns audios ordered by position when loaded', () => {
    setSignedIn(true);
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: mockPlaylistData },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({ id: 'playlist-123' }),
    );

    expect(result.current).toEqual({
      audios: expectedAudios,
      playlist: mockPlaylistData,
      isLoading: false,
      error: undefined,
    });
  });

  it('returns a graceful empty state for a private/nonexistent id (anon)', () => {
    setSignedIn(false);
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist_by_pk: null },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({ id: 'missing' }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: false,
      error: undefined,
    });
  });

  it('handles error from useRequest', () => {
    setSignedIn(true);
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylistDetail({ id: 'playlist-123' }),
    );

    expect(result.current).toEqual({
      audios: [],
      playlist: null,
      isLoading: false,
      error: mockError,
    });
  });
});
