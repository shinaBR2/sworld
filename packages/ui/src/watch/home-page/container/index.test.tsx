import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoCard } from '../../videos/video-card';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import { HomeContainer } from './index';

vi.mock('../../videos/video-card/skeleton', () => ({
  VideoSkeleton: vi.fn(() => <div>VideoSkeleton</div>),
}));

vi.mock('../../videos/video-card', () => ({
  VideoCard: vi.fn(() => <div>VideoCard</div>),
}));

vi.mock('../utils', () => ({
  genlinkProps: (video: { id: string; slug: string }) => ({
    to: '/video/$slug-$id',
    params: {
      slug: video.slug,
      id: video.id,
    },
  }),
}));

const MockLink = vi.fn();

describe('HomeContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeletons when loading', () => {
    render(
      <HomeContainer
        queryRs={{
          isLoading: true,
          videos: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoSkeleton).toHaveBeenCalledTimes(12);
  });

  it('should render video cards when not loading', () => {
    const mockVideos = [
      { id: '1', title: 'Video 1' },
      { id: '2', title: 'Video 2' },
    ];

    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: mockVideos,
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).toHaveBeenCalledTimes(2);
    expect(VideoCard).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideos[0],
        asLink: true,
        LinkComponent: MockLink,
      }),
      expect.anything(),
    );
  });

  it('should handle empty videos array', () => {
    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).not.toHaveBeenCalled();
  });
});
