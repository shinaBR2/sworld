import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadHome } from './home';

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

const setData = (data: unknown, isLoading = false) => {
  vi.mocked(useRequest).mockReturnValue({
    data,
    isLoading,
  } as ReturnType<typeof useRequest>);
};

const audio = (id: string) => ({
  id,
  name: `Test Audio ${id}`,
  source: `source${id}.mp3`,
  thumbnailUrl: `thumb${id}.jpg`,
  artistName: `Artist ${id}`,
  audio_tags: [{ tag_id: 't1' }],
});

describe('useLoadHome', () => {
  const mockData = {
    audios: [audio('1'), audio('2')],
    tags: [
      { id: 't1', name: 'happy' },
      { id: 't2', name: 'sad' },
    ],
    playlist: [{ id: 'p1', title: 'Chill', slug: 'chill' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('mock-token');
    setData(undefined, false);
  });

  it('attaches the token and role-scoped key when signed in', () => {
    setSignedIn(true);

    renderHook(() => useLoadHome());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-home', true],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
    });
  });

  it('omits the token when anonymous so Hasura runs the anonymous role', () => {
    setSignedIn(false);

    renderHook(() => useLoadHome());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-home', false],
      getAccessToken: undefined,
      document: expect.anything(),
    });
  });

  it('transforms audios, feelings and playlists from a single query', () => {
    setSignedIn(true);
    setData(mockData);

    const { result } = renderHook(() => useLoadHome());

    expect(result.current.audios).toEqual([
      {
        id: '1',
        name: 'Test Audio 1',
        source: 'source1.mp3',
        thumbnailUrl: 'thumb1.jpg',
        artistName: 'Artist 1',
        audio_tags: [{ tag_id: 't1' }],
      },
      {
        id: '2',
        name: 'Test Audio 2',
        source: 'source2.mp3',
        thumbnailUrl: 'thumb2.jpg',
        artistName: 'Artist 2',
        audio_tags: [{ tag_id: 't1' }],
      },
    ]);
    expect(result.current.feelings).toEqual(mockData.tags);
    expect(result.current.playlists).toEqual(mockData.playlist);
  });

  it('returns empty collections while loading', () => {
    setSignedIn(false);
    setData(undefined, true);

    const { result } = renderHook(() => useLoadHome());

    expect(result.current.audios).toEqual([]);
    expect(result.current.feelings).toEqual([]);
    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
