import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useLoadVideos } from './videos';
import React from 'react';
import { QueryProvider } from '../../providers/query';

const mockConfig = {
  hasuraUrl: 'https://test-hasura.url',
};

const queryContextValue = {
  hasuraUrl: 'https://test-hasura.url',
};
let mockQueryState = {
  data: undefined,
  isLoading: true,
};
const mockUseQuery = jest.fn();

// jest.mock('graphql-request');
jest.mock('graphql-request', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any) => mockUseQuery(...args),
}));
jest.mock('../../providers/query', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => children,
  useQueryContext: () => queryContextValue,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryProvider config={mockConfig}>{children}</QueryProvider>;
}

describe('useLoadVideos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockImplementation(() => ({
      data: undefined,
      isLoading: true,
    }));
    mockGetAccessToken.mockResolvedValue('test-token');
  });

  const mockGetAccessToken = jest
    .fn<() => Promise<string>>()
    .mockResolvedValue('test-token');

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryState = {
      data: undefined,
      isLoading: true,
    };
  });

  it('should fetch videos successfully', async () => {
    const mockVideos = [
      { id: '1', title: 'Video 1' },
      { id: '2', title: 'Video 2' },
    ];

    const { result, rerender } = renderHook(
      () => useLoadVideos({ getAccessToken: mockGetAccessToken }),
      { wrapper: Wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    mockUseQuery.mockImplementation(() => ({
      data: { videos: mockVideos },
      isLoading: false,
    }));

    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.videos).toEqual(mockVideos);
    });
  });

  it('should handle API error', async () => {
    const mockError = new Error('API Error');
    const { result, rerender } = renderHook(
      () => useLoadVideos({ getAccessToken: mockGetAccessToken }),
      { wrapper: Wrapper }
    );

    mockUseQuery.mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      error: mockError,
    }));
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.videos).toBeUndefined();
  });
});
