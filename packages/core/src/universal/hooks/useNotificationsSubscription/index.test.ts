import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContextValue, useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';
import { useNotificationsSubscription } from './index';

// Mock dependencies
vi.mock('../../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../useSubscription', () => ({
  useSubscription: vi.fn(),
}));

describe('useNotificationsSubscription', () => {
  const mockUrl = 'wss://test-hasura.com/graphql';

  it('should initialize with loading state', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should handle successful data fetch', () => {
    const mockNotifications = [
      {
        id: '1',
        entityId: 'entity1',
        entityType: 'type1',
        type: 'notification',
        readAt: null,
        message: 'Test message',
        link: 'test-link',
        metadata: {},
        title: 'Test Title',
      },
    ];

    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: { notifications: mockNotifications },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(result.current).toEqual({
      data: mockNotifications,
      isLoading: false,
      error: null,
    });
  });

  it('should handle error state', () => {
    const mockError = new Error('Subscription failed');

    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(result.current).toEqual({
      data: [],
      isLoading: false,
      error: mockError,
    });
  });

  it('should disable subscription when user is not signed in', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: false,
    } as AuthContextValue);

    renderHook(() => useNotificationsSubscription(mockUrl));

    expect(useSubscription).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: expect.any(String),
      disabled: true,
    });
  });

  it('should return empty array when data is null', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(result.current).toEqual({
      data: [],
      isLoading: false,
      error: null,
    });
  });
});
