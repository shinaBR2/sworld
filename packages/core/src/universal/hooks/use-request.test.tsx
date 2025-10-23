import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import request from 'graphql-request';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TypedDocumentString } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { isTokenExpired } from '../graphql/errors';
import { useRequest } from './use-request';

vi.mock('graphql-request', () => ({
  default: vi.fn(),
}));

vi.mock('../../providers/query', () => ({
  useQueryContext: vi.fn(),
}));

vi.mock('../graphql/errors', () => ({
  isTokenExpired: vi.fn(),
}));

vi.mock('../../providers/auth', () => ({
  useAuthContext: vi.fn(),
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
  // Create a mock TypedDocumentString
  const mockDocument = {
    toString: () => 'query { test }',
    __apiType: 'query',
  } as unknown as TypedDocumentString<{ test: string }, {}>;
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
    vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.mocked(useQueryContext).mockReturnValue({
      hasuraUrl: mockHasuraUrl,
    });

    // Set up default auth context mock
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      signOut: vi.fn(),
      isLoading: false,
      user: null,
      isAdmin: false,
      signIn: vi.fn(),
      getAccessToken: mockGetAccessToken,
    });

    // Reset mocks to their default successful state
    mockGetAccessToken.mockResolvedValue(mockToken);
    vi.mocked(request).mockResolvedValue(mockResponse);
    vi.mocked(isTokenExpired).mockReturnValue(false);
  });

  it('should fetch data anonymously without getAccessToken', async () => {
    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-anonymous'],
          document: mockDocument,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: mockDocument.toString(),
      requestHeaders: {
        'content-type': 'application/json',
      },
      variables: undefined,
    });
  });

  it('should handle not signed in scenario when getAccessToken is provided', async () => {
    const mockSignOut = vi.fn();
    vi.mocked(useAuthContext).mockReturnValueOnce({
      isSignedIn: false,
      signOut: mockSignOut,
      isLoading: false,
      user: null,
      isAdmin: false,
      signIn: vi.fn(),
      getAccessToken: mockGetAccessToken,
    });

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-not-signed-in'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.error?.message).toBe(
      'Session expired. Please sign in again.',
    );
    expect(request).not.toHaveBeenCalled();
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
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(mockGetAccessToken).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: mockDocument.toString(),
      requestHeaders: {
        'content-type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      variables: mockVariables,
    });
  });

  it('should handle empty token', async () => {
    mockGetAccessToken.mockResolvedValueOnce('');

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-empty-token'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.error?.message).toBe('Invalid access token');
    expect(request).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Authentication failed:',
      expect.any(Error),
    );
  });

  it('should handle token fetch error', async () => {
    const tokenError = new Error('Failed to get token');
    mockGetAccessToken.mockRejectedValueOnce(tokenError);

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-error'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.error).toBe(tokenError);
    expect(request).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Authentication failed:',
      tokenError,
    );
  });

  it('should handle token expiration', async () => {
    const expiredTokenError = new Error('Token expired');
    vi.mocked(request).mockRejectedValueOnce(expiredTokenError);
    vi.mocked(isTokenExpired).mockReturnValueOnce(true);

    const mockSignOut = vi.fn();

    // Create a test document with the correct type
    const testDocument = {
      toString: () => 'query { test }',
      __apiType: 'query',
    } as unknown as TypedDocumentString<{ test: string }, {}>;

    // Mock the auth context
    vi.mocked(useAuthContext).mockReturnValueOnce({
      isSignedIn: true,
      signOut: mockSignOut,
      // Add other required properties from AuthContextValue
      isLoading: false,
      user: null,
      isAdmin: false,
      signIn: vi.fn(),
      getAccessToken: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-expired-token'],
          getAccessToken: mockGetAccessToken,
          document: testDocument,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.error?.message).toBe(
      'Session expired. Please sign in again.',
    );
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
      { wrapper },
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
          document: {
            toString: () => 'query GetSettings { settings { theme } }',
            __apiType: 'query',
          } as unknown as TypedDocumentString<
            { settings: { theme: string } },
            {}
          >,
        }),
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: expect.any(String),
      requestHeaders: {
        Authorization: `Bearer ${mockToken}`,
        'content-type': 'application/json',
      },
      variables: undefined,
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
      { wrapper },
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 },
    );

    rerender();

    expect(request).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(
      () =>
        useRequest({
          queryKey: ['test-disabled'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it('should fetch when enabled changes from false to true', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useRequest({
          queryKey: ['test-enabled-change'],
          getAccessToken: mockGetAccessToken,
          document: mockDocument,
          enabled,
        }),
      {
        wrapper,
        initialProps: { enabled: false },
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(request).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(request).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockResponse);
  });
});
