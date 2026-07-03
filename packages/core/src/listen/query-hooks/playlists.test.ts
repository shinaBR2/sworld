import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadPlaylists, useLoadPublicPlaylists } from './playlists';

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

describe('useLoadPlaylists', () => {
  const mockPlaylists = [
    { id: '1', title: 'Chill', slug: 'chill' },
    { id: '2', title: 'Focus', slug: 'focus' },
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

    renderHook(() => useLoadPlaylists());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlists', true],
      getAccessToken: mockGetAccessToken,
      document: expect.anything(),
    });
  });

  it('omits the token when anonymous so Hasura runs the anonymous role', () => {
    setSignedIn(false);

    renderHook(() => useLoadPlaylists());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-playlists', false],
      getAccessToken: undefined,
      document: expect.anything(),
    });
  });

  it('returns loading state from useRequest', () => {
    setSignedIn(false);
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPlaylists());

    expect(result.current).toEqual({
      playlists: [],
      isLoading: true,
      error: undefined,
    });
  });

  it('returns data when loaded', () => {
    setSignedIn(true);
    vi.mocked(useRequest).mockReturnValue({
      data: { playlist: mockPlaylists },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPlaylists());

    expect(result.current).toEqual({
      playlists: mockPlaylists,
      isLoading: false,
      error: undefined,
    });
  });

  it('handles null response data', () => {
    setSignedIn(false);
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPlaylists());

    expect(result.current).toEqual({
      playlists: [],
      isLoading: false,
      error: undefined,
    });
  });

  it('surfaces error from useRequest', () => {
    setSignedIn(true);
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadPlaylists());

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

  it('should set up useRequest without an access token', () => {
    renderHook(() => useLoadPublicPlaylists());

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['listen-public-playlists'],
      document: expect.anything(),
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
});
