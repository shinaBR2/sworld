import { AuthContextValue } from './../../../providers/auth';
// packages/core/src/universal/hooks/useFeatureFlagSubscription/index.test.tsx
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';
import { FEATURE_FLAGS_SUBSCRIPTION, useFeatureFlagSubscription } from './index';

// Mock dependencies
vi.mock('../../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../useSubscription', () => ({
  useSubscription: vi.fn(),
}));

// Mock the helper with a simple implementation
vi.mock('./helpers', () => ({
  checkFeatureFlag: vi
    .fn()
    .mockImplementation(() => false)
    .mockReturnValueOnce(true) // first feature flag
    .mockReturnValueOnce(false), // second feature flag
}));

describe('useFeatureFlagSubscription', () => {
  const mockUrl = 'https://test-hasura.com/graphql';
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockImplementation(({ hasuraUrl, query }) => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(vi.mocked(useSubscription)).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: FEATURE_FLAGS_SUBSCRIPTION.toString(),
    });
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should return error state', () => {
    const mockError = new Error('Subscription failed');
    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockImplementation(({ hasuraUrl, query }) => ({
      data: null,
      isLoading: false,
      error: mockError,
    }));

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(vi.mocked(useSubscription)).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: FEATURE_FLAGS_SUBSCRIPTION.toString(),
    });
    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: mockError,
    });
  });

  it('should process feature flags correctly', () => {
    const mockFeatureFlags = {
      feature_flag: [
        {
          id: '1',
          name: 'feature1',
          conditions: { someCondition: true },
        },
        {
          id: '2',
          name: 'feature2',
          conditions: { someOtherCondition: false },
        },
      ],
    };

    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: mockFeatureFlags,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: {
        feature1: true,
        feature2: false,
      },
      isLoading: false,
      error: null,
    });
  });

  it('should handle empty feature flags list', () => {
    const mockFeatureFlags = {
      feature_flag: [],
    };

    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: mockFeatureFlags,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: {},
      isLoading: false,
      error: null,
    });
  });

  it('should handle null conditions', () => {
    const mockFeatureFlags = {
      feature_flag: [
        {
          id: '1',
          name: 'feature1',
          conditions: null,
        },
      ],
    };

    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: mockFeatureFlags,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: {
        feature1: false,
      },
      isLoading: false,
      error: null,
    });
  });

  it('should handle missing user ID', () => {
    const mockFeatureFlags = {
      feature_flag: [
        {
          id: '1',
          name: 'feature1',
          conditions: { someMockCondition: true },
        },
      ],
    };

    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
    } as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: mockFeatureFlags,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current.data).toEqual({
      feature1: false,
    });
  });

  it('should memoize processed flags when data and user ID remain the same', () => {
    const mockFeatureFlags = {
      feature_flag: [
        {
          id: '1',
          name: 'feature1',
          conditions: { someMockCondition: true },
        },
      ],
    };

    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
    } as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: mockFeatureFlags,
      isLoading: false,
      error: null,
    });

    const { result, rerender } = renderHook(() => useFeatureFlagSubscription(mockUrl));
    const firstResult = result.current.data;

    // Rerender with same data
    rerender();

    expect(result.current.data).toBe(firstResult);
  });
});
