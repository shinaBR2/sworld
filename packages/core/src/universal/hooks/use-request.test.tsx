import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRequest } from './use-request';
import request from 'graphql-request';
import { useQueryContext } from '../../providers/query';

vi.mock('graphql-request', () => ({
  default: vi.fn(),
}));

vi.mock('../../providers/query', () => ({
  useQueryContext: vi.fn(),
}));

describe('useRequest', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

  const mockHasuraUrl = 'https://test-hasura.com/graphql';
  const mockToken = 'test-token';
  const mockDocument = 'query { test }';
  const mockVariables = { id: '123' };
  const mockResponse = { data: { test: 'success' } };
  const mockGetAccessToken = vi.fn().mockResolvedValue(mockToken);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(useQueryContext).mockReturnValue({
      hasuraUrl: mockHasuraUrl,
    });
    // Reset mocks to their default successful state
    mockGetAccessToken.mockResolvedValue(mockToken);
    vi.mocked(request).mockResolvedValue(mockResponse);
  });

  it('should fetch data anonymously', async () => {
    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test'],
          document: mockDocument,
        }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: mockDocument,
      requestHeaders: {
        'content-type': 'application/json',
      },
    });
  });

  it('should fetch data successfully with variables', async () => {
    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
          variables: mockVariables,
        }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(mockGetAccessToken).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: mockDocument,
      requestHeaders: {
        'content-type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      variables: mockVariables,
    });
  });

  it('should handle token fetch error', async () => {
    const tokenError = new Error('Failed to get token');
    mockGetAccessToken.mockRejectedValue(tokenError);

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-error'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 }
    );

    expect(result.current.error).toBe(tokenError);
    expect(request).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Authentication failed:', tokenError);
  });

  it('should handle request error', async () => {
    const requestError = new Error('Request failed');
    vi.mocked(request).mockRejectedValueOnce(requestError);

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-request-error'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(requestError);
    });

    expect(mockGetAccessToken).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledOnce();
  });

  it('should fetch data without variables', async () => {
    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['settings'],
          getAccessToken: mockGetAccessToken,
          document: 'query GetSettings { settings { theme } }',
        }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: expect.any(String),
      requestHeaders: {
        Authorization: `Bearer ${mockToken}`,
        'content-type': 'application/json',
      },
    });
  });

  it('should use cached data on subsequent requests', async () => {
    const { result, rerender } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-cache'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 }
    );

    rerender();

    expect(request).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockResponse);
  });
});
