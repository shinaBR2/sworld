import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContextValue, useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';
import { checkFeatureFlag } from './helpers';
import { useFeatureFlagSubscription } from './index';

// Mock dependencies
vi.mock('../../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../useSubscription', () => ({
  useSubscription: vi.fn(),
}));

vi.mock('./helpers', () => ({
  checkFeatureFlag: vi.fn(),
}));

describe('useFeatureFlagSubscription', () => {
  const mockUrl = 'wss://hasura.example.com/graphql';
  const mockUserId = 'user-123';
  const mockFeatureFlags = [
    {
      id: '1',
      name: 'feature1',
      conditions: '{"rules": []}',
    },
    {
      id: '2',
      name: 'feature2',
      conditions: '{"rules": []}',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
      user: { id: mockUserId },
      isSignedIn: true,
    } as unknown as AuthContextValue);
    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    vi.mocked(checkFeatureFlag).mockReturnValue(true);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should process feature flags when data is available', () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: {
        feature_flag: mockFeatureFlags,
      },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: {
        feature1: true,
        feature2: true,
      },
      isLoading: false,
      error: null,
    });

    expect(checkFeatureFlag).toHaveBeenCalledTimes(2);
    expect(checkFeatureFlag).toHaveBeenCalledWith(mockFeatureFlags[0].conditions, mockUserId);
    expect(checkFeatureFlag).toHaveBeenCalledWith(mockFeatureFlags[1].conditions, mockUserId);
  });

  it('should handle subscription errors', () => {
    const mockError = new Error('Subscription failed');
    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: mockError,
    });
  });

  it('should not subscribe when user is not signed in', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      isSignedIn: false,
    } as unknown as AuthContextValue);

    renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(useSubscription).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: expect.any(String),
      enabled: false,
    });
  });

  it('should use empty string as userId when user is not available', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      isSignedIn: true,
    } as unknown as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: {
        feature_flag: mockFeatureFlags,
      },
      isLoading: false,
      error: null,
    });

    renderHook(() => useFeatureFlagSubscription(mockUrl));

    expect(checkFeatureFlag).toHaveBeenCalledWith(expect.any(String), '');
  });

  it('should reprocess flags when user id changes', () => {
    const { rerender } = renderHook(
      ({ userId }) => {
        vi.mocked(useAuthContext).mockReturnValue({
          user: { id: userId },
          isSignedIn: true,
        } as unknown as AuthContextValue);
        return useFeatureFlagSubscription(mockUrl);
      },
      { initialProps: { userId: 'user-1' } }
    );

    vi.mocked(useSubscription).mockReturnValue({
      data: {
        feature_flag: mockFeatureFlags,
      },
      isLoading: false,
      error: null,
    });

    rerender({ userId: 'user-2' });

    expect(checkFeatureFlag).toHaveBeenCalledWith(expect.any(String), 'user-2');
  });
});
