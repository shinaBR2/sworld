import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMutationRequest } from './';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import request from 'graphql-request';
import { type FC, type PropsWithChildren } from 'react';

// Mock graphql-request
vi.mock('graphql-request', () => ({
  default: vi.fn(),
}));

// Mock useQueryContext hook
const mockHasuraUrl = 'https://hasura-dev.example.com/v1/graphql';
vi.mock('../../../providers/query', () => ({
  useQueryContext: () => ({
    hasuraUrl: mockHasuraUrl,
  }),
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe('useMutationRequest', () => {
  const mockDocument = 'mutation { updateUser(id: $id) { id name } }';
  const mockVariables = { id: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should execute mutation without authentication', async () => {
    const mockResponse = { updateUser: { id: '123', name: 'Test User' } };
    vi.mocked(request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).resolves.toEqual(mockResponse);
    });

    expect(request).toHaveBeenCalledWith({
      url: mockHasuraUrl,
      document: mockDocument,
      requestHeaders: {
        'content-type': 'application/json',
      },
      variables: mockVariables,
    });
  });

  it('should execute mutation with valid authentication token', async () => {
    const mockToken = 'valid-token-123';
    const mockGetAccessToken = vi.fn().mockResolvedValue(mockToken);
    const mockResponse = { updateUser: { id: '123', name: 'Test User' } };
    vi.mocked(request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).resolves.toEqual(mockResponse);
    });

    expect(mockGetAccessToken).toHaveBeenCalled();
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

  it('should handle authentication failure', async () => {
    const mockGetAccessToken = vi.fn().mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).rejects.toThrow('Auth failed');
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('should handle empty token from getAccessToken', async () => {
    const mockGetAccessToken = vi.fn().mockResolvedValue('');

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
          getAccessToken: mockGetAccessToken,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).rejects.toThrow('Invalid access token');
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('should handle GraphQL mutation failure', async () => {
    const mockError = new Error('GraphQL error');
    vi.mocked(request).mockRejectedValueOnce(mockError);

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).rejects.toThrow('GraphQL error');
    });
  });

  it('should apply custom mutation options', async () => {
    const mockResponse = { updateUser: { id: '123', name: 'Test User' } };
    vi.mocked(request).mockResolvedValueOnce(mockResponse);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
          options: {
            onSuccess,
          },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const mutatePromise = result.current.mutateAsync(mockVariables);
    await waitFor(async () => {
      await expect(mutatePromise).resolves.toEqual(mockResponse);
    });
    expect(onSuccess).toHaveBeenCalledWith(mockResponse, mockVariables, undefined);
  });

  it('should handle concurrent mutations independently', async () => {
    const mockResponse1 = { updateUser: { id: '123', name: 'User 1' } };
    const mockResponse2 = { updateUser: { id: '456', name: 'User 2' } };

    vi.mocked(request).mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(
      () =>
        useMutationRequest({
          document: mockDocument,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    const promise1 = result.current.mutateAsync({ id: '123' });
    const promise2 = result.current.mutateAsync({ id: '456' });

    await waitFor(async () => {
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
    });
  });

  it('should handle empty variables object', async () => {
    const mockResponse = { updateUser: null };
    vi.mocked(request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMutationRequest({ document: mockDocument }), { wrapper: createWrapper() });

    const mutatePromise = result.current.mutateAsync({});
    await waitFor(async () => {
      await expect(mutatePromise).resolves.toEqual(mockResponse);
    });
  });
});
