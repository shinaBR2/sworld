import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryProvider } from '../../providers/query';
import { useLoadAudios, useLoadPublicAudios } from './audios';

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

describe('useLoadAudios', () => {
  const mockData = {
    audios: [
      {
        id: '1',
        name: 'Test Audio 1',
        source: 'source1.mp3',
        thumbnailUrl: 'thumb1.jpg',
        public: true,
        artistName: 'Artist 1',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Test Audio 2',
        source: 'source2.mp3',
        thumbnailUrl: 'thumb2.jpg',
        public: false,
        artistName: 'Artist 2',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ],
    tags: [
      {
        id: 't1',
        name: 'happy',
      },
      {
        id: 't2',
        name: 'sad',
      },
    ],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryProvider config={mockConfig}>{children}</QueryProvider>
  );

  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
  });

  it('should fetch audios and tags data successfully', () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    const { result } = renderHook(
      () => useLoadAudios({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(
      () => useLoadAudios({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const networkError = new Error('Network error');
    const validationError = new Error('Validation error');

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: networkError,
    });

    const { result, rerender } = renderHook(
      () => useLoadAudios({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(networkError);

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: validationError,
    });

    rerender();

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(validationError);
  });

  it('should handle empty data', () => {
    const emptyData = {
      audios: [],
      tags: [],
    };

    mockUseQuery.mockReturnValue({
      data: emptyData,
      isLoading: false,
    });

    const { result } = renderHook(
      () => useLoadAudios({ getAccessToken: mockGetAccessToken }),
      { wrapper },
    );

    expect(result.current.data).toEqual(emptyData);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useLoadPublicAudios', () => {
  const mockData = {
    audios: [
      {
        id: '1',
        name: 'Test Audio 1',
        source: 'source1.mp3',
        thumbnailUrl: 'thumb1.jpg',
        public: true,
        artistName: 'Artist 1',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Test Audio 2',
        source: 'source2.mp3',
        thumbnailUrl: 'thumb2.jpg',
        public: true,
        artistName: 'Artist 2',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ],
    tags: [
      {
        id: 't1',
        name: 'happy',
      },
      {
        id: 't2',
        name: 'sad',
      },
    ],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryProvider config={mockConfig}>{children}</QueryProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
  });

  it('should fetch audios and tags data successfully', () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    const { result } = renderHook(() => useLoadPublicAudios(), { wrapper });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLoadPublicAudios(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const networkError = new Error('Network error');
    const validationError = new Error('Validation error');

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: networkError,
    });

    const { result, rerender } = renderHook(() => useLoadPublicAudios(), {
      wrapper,
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(networkError);

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: validationError,
    });

    rerender();

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(validationError);
  });

  it('should handle empty data', () => {
    const emptyData = {
      audios: [],
      tags: [],
    };

    mockUseQuery.mockReturnValue({
      data: emptyData,
      isLoading: false,
    });

    const { result } = renderHook(() => useLoadPublicAudios(), { wrapper });

    expect(result.current.data).toEqual(emptyData);
    expect(result.current.isLoading).toBe(false);
  });
});
