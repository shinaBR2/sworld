import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { useQueryContext, QueryProvider, QueryContextValue } from './index';

// Mock the useFeatureFlagSubscription hook
vi.mock('../universal/hooks/useFeatureFlagSubscription', () => ({
  useFeatureFlagSubscription: (_hasuraUrl: string) => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

describe('Query Provider and Context', () => {
  const mockConfig = {
    hasuraUrl: 'https://test-hasura.com/graphql',
  };

  const expectedContextValue: QueryContextValue = {
    hasuraUrl: mockConfig.hasuraUrl,
    featureFlags: {
      data: null,
      isLoading: false,
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
      // Access the result to trigger the error
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
      hasuraUrl: 'https://nested-hasura.com/graphql',
    };

    const expectedNestedContextValue: QueryContextValue = {
      hasuraUrl: nestedConfig.hasuraUrl,
      featureFlags: {
        data: null,
        isLoading: false,
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

    const expectedIncompleteContextValue: QueryContextValue = {
      hasuraUrl: '',
      featureFlags: {
        data: null,
        isLoading: false,
        error: null,
      },
    };

    const TestComponent = () => {
      contextValue = useQueryContext();
      return null;
    };

    render(
      <QueryProvider config={incompleteConfig}>
        <TestComponent />
      </QueryProvider>
    );

    expect(contextValue).toEqual(expectedIncompleteContextValue);
  });
});
