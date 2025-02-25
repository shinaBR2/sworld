import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLoadVideoDetail } from './index';
import { useRequest } from '../../../universal/hooks/use-request';
import { MEDIA_TYPES } from '../types';

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
    thumbnailUrl: 'test-thumbnail',
    user: {
      username: 'testuser',
    },
    user_video_histories: [
      {
        last_watched_at: '2024-01-02',
        progress_seconds: 30,
      },
    ],
    duration: 600,
  };

  const mockVideoDetail = {
    id: 'test-id',
    title: 'Test Video',
    description: 'Test Description',
    source: 'test-source',
    slug: 'test-slug',
    createdAt: '2024-01-01',
    thumbnailUrl: 'test-thumbnail',
    duration: 600,
  };

  const expectedTransformedVideo = {
    id: 'test-id',
    type: MEDIA_TYPES.VIDEO,
    title: 'Test Video',
    description: 'Test Description',
    source: 'test-source',
    slug: 'test-slug',
    createdAt: '2024-01-01',
    thumbnailUrl: 'test-thumbnail',
    user: {
      username: 'testuser',
    },
    lastWatchedAt: '2024-01-02',
    progressSeconds: 30,
    duration: 600,
  };

  beforeEach(() => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useRequest>);
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
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [],
      videoDetail: null,
      playlist: null,
      isLoading: true,
      error: undefined,
    });
  });

  it('should return data when loaded', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: {
        videos: [mockVideo],
        videos_by_pk: mockVideoDetail,
      },
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [expectedTransformedVideo],
      videoDetail: mockVideoDetail,
      playlist: null,
      isLoading: false,
      error: undefined,
    });
  });

  it('should handle null response data', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [],
      videoDetail: null,
      playlist: null,
      isLoading: false,
    });
  });

  it('should handle error from useRequest', () => {
    const mockError = new Error('API Error');
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() => useLoadVideoDetail(mockProps));

    expect(result.current).toEqual({
      videos: [],
      videoDetail: null,
      playlist: null,
      isLoading: false,
      error: mockError,
    });
  });
});
