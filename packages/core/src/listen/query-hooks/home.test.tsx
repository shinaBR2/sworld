import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryProvider } from '../../providers/query';
import { useLoadHome, useLoadPublicHome } from './home';

const mockConfig = {
  hasuraUrl: 'https://test-hasura.url',
};

const queryContextValue = {
  hasuraUrl: 'https://test-hasura.url',
};

const mockUseQuery = vi.fn();

vi.mock('graphql-request', () => ({
  default: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any) => mockUseQuery(...args),
}));

vi.mock('../../providers/query', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => children,
  useQueryContext: () => queryContextValue,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider config={mockConfig}>{children}</QueryProvider>
);

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

  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
  });

  it('transforms audios, feelings and playlists from a single query', () => {
    mockUseQuery.mockReturnValue({ data: mockData, isLoading: false });

    const { result } = renderHook(
      () => useLoadHome({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

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
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty collections while loading', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(
      () => useLoadHome({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.audios).toEqual([]);
    expect(result.current.feelings).toEqual([]);
    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('passes through the error', () => {
    const networkError = new Error('Network error');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: networkError,
    });

    const { result } = renderHook(
      () => useLoadHome({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.error).toBe(networkError);
    expect(result.current.audios).toEqual([]);
  });
});

describe('useLoadPublicHome', () => {
  const mockData = {
    audios: [audio('1')],
    tags: [{ id: 't1', name: 'happy' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
  });

  it('transforms public audios and feelings, with no playlists', () => {
    mockUseQuery.mockReturnValue({ data: mockData, isLoading: false });

    const { result } = renderHook(() => useLoadPublicHome(), { wrapper });

    expect(result.current.audios).toEqual([
      {
        id: '1',
        name: 'Test Audio 1',
        source: 'source1.mp3',
        thumbnailUrl: 'thumb1.jpg',
        artistName: 'Artist 1',
        audio_tags: [{ tag_id: 't1' }],
      },
    ]);
    expect(result.current.feelings).toEqual(mockData.tags);
    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty collections while loading', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useLoadPublicHome(), { wrapper });

    expect(result.current.audios).toEqual([]);
    expect(result.current.feelings).toEqual([]);
    expect(result.current.playlists).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
