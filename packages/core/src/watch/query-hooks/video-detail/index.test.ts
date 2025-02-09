import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadVideoDetail } from './index';
import { useRequest } from '../../../universal/hooks/use-request';

vi.mock('../../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

describe('useLoadVideoDetail', () => {
  const mockProps = {
    id: 'test-id',
    getAccessToken: vi.fn().mockResolvedValue('test-token'),
  };

  const mockVideo = {
    id: 'test-id',
    title: 'Test Video',
    description: 'Test Description',
    source: 'test-source',
    slug: 'test-slug',
    createdAt: '2024-01-01',
    user: {
      username: 'testuser',
    },
  };

  const mockVideoDetail = {
    id: 'test-id',
    source: 'test-source',
    thumbnailUrl: 'test-thumbnail',
    title: 'Test Video',
    description: 'Test Description',
  };

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('should set up useRequest with correct params', () => {
    renderHook(() => useLoadVideoDetail(mockProps));

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['video-detail', mockProps.id],
      getAccessToken: mockProps.getAccessToken,
      document: expect.stringContaining('query VideoDetail'),
      variables: { id: mockProps.id },
    });
  });

  it('should return loading state from useRequest', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [],
      videoDetail: {},
      isLoading: true,
    });
  });

  it('should return data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: {
        videos: [mockVideo],
        videos_by_pk: mockVideoDetail,
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [mockVideo],
      videoDetail: mockVideoDetail,
      isLoading: false,
    });
  });

  it('should handle null response data', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [],
      videoDetail: {},
      isLoading: false,
    });
  });
});
