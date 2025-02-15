import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HomeContainer } from './index';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import { VideoCard } from '../../videos/video-card';

vi.mock('../../videos/video-card/skeleton', () => ({
  VideoSkeleton: vi.fn(() => <div>VideoSkeleton</div>),
}));

vi.mock('../../videos/video-card', () => ({
  VideoCard: vi.fn(() => <div>VideoCard</div>),
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
      />
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
      />
    );

    expect(VideoCard).toHaveBeenCalledTimes(2);
    expect(VideoCard).toHaveBeenCalledWith(
      expect.objectContaining({
        video: mockVideos[0],
        asLink: true,
        LinkComponent: MockLink,
      }),
      expect.anything()
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
      />
    );

    expect(VideoCard).not.toHaveBeenCalled();
  });
});
