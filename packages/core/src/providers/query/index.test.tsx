// packages/core/src/providers/query/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { useQueryContext, QueryProvider } from './index';
import type { QueryContextValue } from './index';

// Mock the useSubscription hook
vi.mock('../universal/hooks/useSubscription', () => ({
  useSubscription: () => ({
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
      </QueryProvider>
    );

    expect(contextValue).toEqual(expectedContextValue);
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
      </QueryProvider>
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
      </QueryProvider>
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
      </QueryProvider>
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
      </QueryProvider>
    );

    expect(contextValue).toEqual({
      hasuraUrl: undefined,
      featureFlags: {
        data: null,
        isLoading: true,
        error: null,
      },
    });
  });
});
