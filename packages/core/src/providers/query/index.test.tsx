// packages/core/src/providers/query/index.test.tsx

import { QueryClient } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SubscriptionParams } from '../../universal/hooks/useSubscription';
import type { QueryContextValue } from './index';
import { QueryProvider, useQueryContext } from './index';

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockImplementation(() => ({
    removeQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock('@rollbar/react', () => ({
  useRollbar: () => ({
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    critical: vi.fn(),
  }),
}));

vi.mock('../../universal/tracker', () => ({
  useTracker: () => ({
    captureError: vi.fn(),
  }),
}));

vi.mock('../universal/hooks/useSubscription', () => ({
  useSubscription: ({}: SubscriptionParams) => ({
    data: null,
    isLoading: true,
    error: null,
  }),
}));

// Mock the useFeatureFlagSubscription hook
vi.mock('../../universal/hooks/useFeatureFlagSubscription', () => ({
  useFeatureFlagSubscription: () => ({
    data: null,
    isLoading: true,
    error: null,
  }),
}));

// Mock WebSocket
// @ts-expect-error
global.WebSocket = vi.fn().mockImplementation(() => ({
  onopen: vi.fn(),
  onmessage: vi.fn(),
  onerror: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  readyState: WebSocket.OPEN,
}));

describe('Query Provider and Context', () => {
  const mockConfig = {
    hasuraUrl: 'wss://test-hasura.com/graphql',
  };

  const expectedContextValue: QueryContextValue = {
    hasuraUrl: mockConfig.hasuraUrl,
    featureFlags: {
      data: null,
      isLoading: true,
      error: null,
    },
    notifications: {
      data: null,
      isLoading: true,
      error: null,
    },
    invalidateQuery: expect.any(Function),
  };

  it('should provide context values to children', () => {
    let contextValue: QueryContextValue | undefined;

    const TestComponent = () => {
      contextValue = useQueryContext();
      return null;
    };

    render(
      <QueryProvider config={mockConfig}>
        <TestComponent />
      </QueryProvider>,
    );

    expect(contextValue).toEqual(expectedContextValue);
  });

  it('should correctly handle invalidateQuery calls', () => {
    const queryKey = ['test-key'];
    const { result } = renderHook(() => useQueryContext(), {
      wrapper: ({ children }) => (
        <QueryProvider config={mockConfig}>{children}</QueryProvider>
      ),
    });

    // Call invalidateQuery
    result.current.invalidateQuery(queryKey);

    // Get the mocked QueryClient instance
    const queryClientInstance = vi.mocked(QueryClient).mock.results[0].value;

    // Verify removeQueries was called first
    expect(queryClientInstance.removeQueries).toHaveBeenCalledWith({
      queryKey,
      exact: true,
    });

    // Verify refetchQueries was called with correct params
    expect(queryClientInstance.refetchQueries).toHaveBeenCalledWith({
      queryKey,
      exact: true,
      type: 'active',
    });

    // Verify order of operations
    const calls = queryClientInstance.removeQueries.mock.invocationCallOrder[0];
    const refetchCalls =
      queryClientInstance.refetchQueries.mock.invocationCallOrder[0];
    expect(calls).toBeLessThan(refetchCalls);
  });

  it('should throw error when useQueryContext is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      const { result } = renderHook(() => useQueryContext());
      result.current;
    }).toThrow('useQueryContext must be used within an QueryProvider');

    spy.mockRestore();
  });

  it('should render children with provider', () => {
    const TestChild = () => <div>Test Child</div>;

    const { container } = render(
      <QueryProvider config={mockConfig}>
        <TestChild />
      </QueryProvider>,
    );

    expect(container.innerHTML).toContain('Test Child');
  });

  it('should pass config correctly through provider chain', () => {
    let contextValue: QueryContextValue | undefined;

    const DeepChild = () => {
      contextValue = useQueryContext();
      return null;
    };

    const MiddleComponent = () => <DeepChild />;

    render(
      <QueryProvider config={mockConfig}>
        <div>
          <MiddleComponent />
        </div>
      </QueryProvider>,
    );

    expect(contextValue).toEqual(expectedContextValue);
  });

  it('should handle multiple nested providers', () => {
    const nestedConfig = {
      hasuraUrl: 'wss://nested-hasura.com/graphql',
    };

    const expectedNestedContextValue: QueryContextValue = {
      hasuraUrl: nestedConfig.hasuraUrl,
      featureFlags: {
        data: null,
        isLoading: true,
        error: null,
      },
      notifications: {
        data: null,
        isLoading: true,
        error: null,
      },
      invalidateQuery: expect.any(Function),
    };

    let outerContextValue: QueryContextValue | undefined;
    let innerContextValue: QueryContextValue | undefined;

    const OuterComponent = () => {
      outerContextValue = useQueryContext();
      return null;
    };

    const InnerComponent = () => {
      innerContextValue = useQueryContext();
      return null;
    };

    render(
      <QueryProvider config={mockConfig}>
        <OuterComponent />
        <QueryProvider config={nestedConfig}>
          <InnerComponent />
        </QueryProvider>
      </QueryProvider>,
    );

    expect(outerContextValue).toEqual(expectedContextValue);
    expect(innerContextValue).toEqual(expectedNestedContextValue);
  });

  it('should handle missing config gracefully', () => {
    const incompleteConfig = {} as { hasuraUrl: string };
    let contextValue: QueryContextValue | undefined;

    const TestComponent = () => {
      contextValue = useQueryContext();
      return null;
    };

    render(
      <QueryProvider config={incompleteConfig}>
        <TestComponent />
      </QueryProvider>,
    );

    expect(contextValue).toEqual({
      hasuraUrl: undefined,
      featureFlags: {
        data: null,
        isLoading: true,
        error: null,
      },
      notifications: {
        data: null,
        isLoading: true,
        error: null,
      },
      invalidateQuery: expect.any(Function),
    });
  });
});
