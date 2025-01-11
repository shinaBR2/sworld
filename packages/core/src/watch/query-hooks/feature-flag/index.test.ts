import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from './index';

// Mock the useRequest hook
vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

// Import the mocked useRequest
import { useRequest } from '../../../universal/hooks/use-request';

describe('useFeatureFlag', () => {
  const mockGetAccessToken = vi.fn().mockResolvedValue('mock-token');
  const defaultProps = {
    name: 'test-feature',
    getAccessToken: mockGetAccessToken,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useRequest with correct parameters', () => {
    // Arrange
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({ data: null, isLoading: false });

    // Act
    renderHook(() => useFeatureFlag(defaultProps));

    // Assert
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

  it('should return null flag when no data is returned', () => {
    // Arrange
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({ data: null, isLoading: false });

    // Act
    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    // Assert
    expect(result.current).toEqual({
      flag: null,
      isLoading: false,
    });
  });

  it('should return null flag when feature_flag array is empty', () => {
    // Arrange
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: { feature_flag: [] },
      isLoading: false,
    });

    // Act
    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    // Assert
    expect(result.current).toEqual({
      flag: null,
      isLoading: false,
    });
  });

  it('should return flag data when feature flag exists', () => {
    // Arrange
    const mockFeatureFlag = {
      id: 'test-id',
      conditions: {
        isGlobal: true,
        allowedUserIds: ['user1', 'user2'],
      },
    };

    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({
      data: { feature_flag: [mockFeatureFlag] },
      isLoading: false,
    });

    // Act
    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    // Assert
    expect(result.current).toEqual({
      flag: mockFeatureFlag,
      isLoading: false,
    });
  });

  it('should handle loading state correctly', () => {
    // Arrange
    const mockUseRequest = useRequest as Mock;
    mockUseRequest.mockReturnValue({ data: null, isLoading: true });

    // Act
    const { result } = renderHook(() => useFeatureFlag(defaultProps));

    // Assert
    expect(result.current).toEqual({
      flag: null,
      isLoading: true,
    });
  });
});
