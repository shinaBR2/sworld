import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { useQueryContext, QueryProvider } from './query';

describe('Query Provider and Context', () => {
  const mockConfig = {
    hasuraUrl: 'https://test-hasura.com/graphql',
  };

  it('should provide context values to children', () => {
    let contextValue;

    const TestComponent = () => {
      contextValue = useQueryContext();
      return null;
    };

    render(
      <QueryProvider config={mockConfig}>
        <TestComponent />
      </QueryProvider>
    );

    expect(contextValue).toEqual({
      hasuraUrl: mockConfig.hasuraUrl,
    });
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
    let contextValue;

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

    expect(contextValue).toEqual({
      hasuraUrl: mockConfig.hasuraUrl,
    });
  });

  it('should handle multiple nested providers', () => {
    const nestedConfig = {
      hasuraUrl: 'https://nested-hasura.com/graphql',
    };

    let outerContextValue;
    let innerContextValue;

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

    expect(outerContextValue).toEqual({
      hasuraUrl: mockConfig.hasuraUrl,
    });
    expect(innerContextValue).toEqual({
      hasuraUrl: nestedConfig.hasuraUrl,
    });
  });

  it('should handle missing config gracefully', () => {
    const incompleteConfig = {} as { hasuraUrl: string };
    let contextValue;

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
    });
  });
});
