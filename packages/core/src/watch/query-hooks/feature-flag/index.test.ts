import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from './index';

// Mock the hooks
vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

vi.mock('../../../providers/auth0', () => ({
  useAuthContext: vi.fn(),
}));

import { useRequest } from '../../../universal/hooks/use-request';
import { useAuthContext } from '../../../providers/auth0';

describe('useFeatureFlag', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');
  const defaultProps = {
    name: 'test-feature',
    getAccessToken: mockGetAccessToken,
  };

  const mockUser = {
    id: 'user1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthContext as Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });
  });

  it('should call useRequest with correct parameters', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({ data: null, isLoading: false });

    renderHook(() => useFeatureFlag(defaultProps));

    expect(mockUseRequest).toHaveBeenCalledWith({
      queryKey: ['feature-flag', 'test-feature'],
      getAccessToken: mockGetAccessToken,
      document: expect.any(String),
      variables: {
        name: 'test-feature',
        site: 'watch',
      },
    });
  });

  it('should return disabled when request is loading', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({ data: null, isLoading: true });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: true,
    });
  });

  it('should return disabled when auth is loading', () => {
    (useAuthContext as Mock).mockReturnValue({
      user: mockUser,
      isLoading: true,
    });

    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: { feature_flag: [] },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: false,
    });
  });

  it('should return disabled when feature_flag array is empty', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: { feature_flag: [] },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: false,
    });
  });

  it('should return disabled when user id is not available', () => {
    (useAuthContext as Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: {
        feature_flag: [{ conditions: { isGlobal: true, allowedUserIds: [] } }],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: false,
    });
  });

  it('should return enabled when feature conditions is null (default)', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: {
        feature_flag: [
          {
            conditions: null,
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: false,
    });
  });

  it('should return enabled when feature is global', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: {
        feature_flag: [
          {
            conditions: {
              isGlobal: true,
              allowedUserIds: [],
            },
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: true,
      isLoading: false,
    });
  });

  it('should return enabled when user is in allowedUserIds', () => {
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: {
        feature_flag: [
          {
            conditions: {
              isGlobal: false,
              allowedUserIds: ['user1', 'user2'],
            },
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: true,
      isLoading: false,
    });
  });

  it('should return disabled when user is not in allowedUserIds', () => {
    (useAuthContext as Mock).mockReturnValue({
      user: { id: 'user3' },
      isLoading: false,
    });

    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: {
        feature_flag: [
          {
            conditions: {
              isGlobal: false,
              allowedUserIds: ['user1', 'user2'],
            },
          },
        ],
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    expect(result.current).toEqual({
      enabled: false,
      isLoading: false,
    });
  });
});
