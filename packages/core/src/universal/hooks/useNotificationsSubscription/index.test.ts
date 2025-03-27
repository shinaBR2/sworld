import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  const mockUrl = 'wss://hasura.example.com/graphql';
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle auth loading state', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: false,
      isLoading: true,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(useSubscription).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: expect.any(String),
      enabled: false,
    });

    expect(result.current).toEqual({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('should handle signed in state', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      isLoading: false,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: { notifications: mockNotifications },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useNotificationsSubscription(mockUrl));

    expect(useSubscription).toHaveBeenCalledWith({
      hasuraUrl: mockUrl,
      query: expect.any(String),
      enabled: true,
    });

    expect(result.current).toEqual({
      data: mockNotifications,
      isLoading: false,
      error: null,
    });
  });

  it('should handle subscription loading state', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      isLoading: false,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: { notifications: mockNotifications },
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

  it('should handle subscription error', () => {
    const mockError = new Error('Subscription failed');
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      isLoading: false,
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

  it('should return empty array when no notifications', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      isLoading: false,
    } as AuthContextValue);

    vi.mocked(useSubscription).mockReturnValue({
      data: { notifications: [] },
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
