import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadManage } from './manage';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

vi.mock('../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

const setUser = (user: { id: string } | null) => {
  vi.mocked(useAuthContext).mockReturnValue({
    user,
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
  audio_tags: [{ tag_id: 't1' }, { tag_id: 't2' }],
});

describe('useLoadManage', () => {
  const mockData = {
    audios: [audio('1')],
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

  it('scopes the query to the signed-in user with the exact-match key', () => {
    setUser({ id: 'u1' });

    renderHook(() => useLoadManage());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-manage'],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
      variables: { userId: 'u1' },
      enabled: true,
    });
  });

  it('disables the query until a user id is known', () => {
    setUser(null);

    renderHook(() => useLoadManage());

    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { userId: '' }, enabled: false }),
    );
  });

  it('flattens each audio feeling join into a tag-id list', () => {
    setUser({ id: 'u1' });
    setData(mockData);

    const { result } = renderHook(() => useLoadManage());

    expect(result.current.audios).toEqual([
      {
        id: '1',
        name: 'Test Audio 1',
        artistName: 'Artist 1',
        thumbnailUrl: 'thumb1.jpg',
        source: 'source1.mp3',
        tagIds: ['t1', 't2'],
      },
    ]);
    expect(result.current.feelings).toEqual(mockData.tags);
    expect(result.current.playlists).toEqual(mockData.playlist);
  });

  it('returns empty collections while loading', () => {
    setUser({ id: 'u1' });
    setData(undefined, true);

    const { result } = renderHook(() => useLoadManage());

    expect(result.current.audios).toEqual([]);
    expect(result.current.feelings).toEqual([]);
    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
