import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadPlaylists, useLoadPublicPlaylists } from './playlists';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadPlaylists', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');

  const mockPlaylists = [
    { id: '1', title: 'Chill', slug: 'chill' },
    { id: '2', title: 'Focus', slug: 'focus' },
  ];

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest with the listen-playlists key', () => {
    renderHook(() => useLoadPlaylists({ getAccessToken: mockGetAccessToken }));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlists'],
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
      useLoadPlaylists({ getAccessToken: mockGetAccessToken }),
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
      useLoadPlaylists({ getAccessToken: mockGetAccessToken }),
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
      useLoadPlaylists({ getAccessToken: mockGetAccessToken }),
    );

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: undefined,
    });
  });

  it('should surface error from useRequest', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadPlaylists({ getAccessToken: mockGetAccessToken }),
    );

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: mockError,
    });
  });
});

describe('useLoadPublicPlaylists', () => {
  const mockPlaylists = [
    { id: '1', title: 'Chill', slug: 'chill' },
    { id: '2', title: 'Focus', slug: 'focus' },
  ];

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
  });

  it('should set up useRequest with the listen-public-playlists key and no token', () => {
    renderHook(() => useLoadPublicPlaylists());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-public-playlists'],
      document: expect.anything(),
    });
  });

  it('should return loading state from useRequest', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPublicPlaylists());

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

    const { result } = renderHook(() => useLoadPublicPlaylists());

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

    const { result } = renderHook(() => useLoadPublicPlaylists());

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: undefined,
    });
  });

  it('should surface error from useRequest', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPublicPlaylists());

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: mockError,
    });
  });
});
