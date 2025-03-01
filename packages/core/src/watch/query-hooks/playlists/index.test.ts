import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadPlaylists } from './index';
import { useRequest } from '../../../universal/hooks/use-request';

// Mock dependencies
vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadPlaylists', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  const mockPlaylists = [
    { id: '1', title: 'Favorites', slug: 'favorites' },
    { id: '2', title: 'Watch Later', slug: 'watch-later' },
    { id: '3', title: 'Music Videos', slug: 'music-videos' },
  ];

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest with correct params', () => {
    renderHook(() =>
      useLoadPlaylists({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['playlists'],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
    });
  });

  it('should return loading state from useRequest', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylists({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      playlists: [],
      isLoading: true,
      error: undefined,
    });
  });

  it('should return data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist: mockPlaylists },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylists({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      playlists: mockPlaylists,
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
      useLoadPlaylists({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      playlists: [],
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
      useLoadPlaylists({
        getAccessToken: mockGetAccessToken,
      })
    );

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: mockError,
    });
  });
});
