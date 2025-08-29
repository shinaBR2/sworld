import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoCard } from '../../videos/video-card';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import type { HistoryVideo } from '../types';
import { HistoryContainer } from './index';

// Mock components
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

const mockVideos = [
  {
    id: '1',
    title: 'Video 1',
    slug: 'video-1',
    createdAt: '2024-02-20',
    user: { username: 'user1' },
  },
  {
    id: '2',
    title: 'Video 2',
    slug: 'video-2',
    createdAt: '2024-02-21',
    user: { username: 'user2' },
  },
] as HistoryVideo[];

const MockLink = vi.fn();

describe('HistoryContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeletons when loading', () => {
    render(
      <HistoryContainer
        isLoading={true}
        videos={[]}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoSkeleton).toHaveBeenCalledTimes(12);
  });

  it('should render video cards when not loading', () => {
    render(
      <HistoryContainer
        isLoading={false}
        videos={mockVideos}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).toHaveBeenCalledTimes(2);
    expect(VideoCard).toHaveBeenCalledWith(
      {
        video: mockVideos[0],
        asLink: true,
        LinkComponent: MockLink,
        linkProps: {
          to: '/video/$slug-$id',
          params: {
            slug: 'video-1',
            id: '1',
          },
        },
      },
      expect.anything(),
    );
  });

  it('should handle empty videos array', () => {
    render(
      <HistoryContainer
        isLoading={false}
        videos={[]}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).not.toHaveBeenCalled();
  });
});
