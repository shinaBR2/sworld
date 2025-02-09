import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLoadVideos } from '.';
import React from 'react';
import { QueryProvider } from '../../../providers/query';

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
vi.mock('../../../providers/query', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => children,
  useQueryContext: () => queryContextValue,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryProvider config={mockConfig}>{children}</QueryProvider>;
}

describe('useLoadVideos', () => {
  const mockGetAccessToken = vi.fn<() => Promise<string>>();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockGetAccessToken.mockResolvedValue('test-token');
  });

  it('should fetch videos successfully', async () => {
    const mockVideos = [
      { id: '1', title: 'Video 1' },
      { id: '2', title: 'Video 2' },
    ];

    const { result, rerender } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    mockUseQuery.mockReturnValue({
      data: { videos: mockVideos },
      isLoading: false,
    });

    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.videos).toEqual(mockVideos);
    });
  });

  it('should handle API error', async () => {
    const mockError = new Error('API Error');

    const { result, rerender } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }), {
      wrapper: Wrapper,
    });

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.videos).toBeUndefined();
    });
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.videos).toBeUndefined();
  });

  it('should handle empty video list', async () => {
    const { result, rerender } = renderHook(() => useLoadVideos({ getAccessToken: mockGetAccessToken }), {
      wrapper: Wrapper,
    });

    mockUseQuery.mockReturnValue({
      data: { videos: [] },
      isLoading: false,
    });

    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.videos).toEqual([]);
    });
  });
});
