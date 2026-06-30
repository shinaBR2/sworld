import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoCard } from '../../videos/video-card';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import { ContinueWatchingSection } from '../continue-watching';
import { WatchEmptyState } from '../empty-state';
import { HomeContainer } from './index';

vi.mock('../empty-state', () => ({
  WatchEmptyState: vi.fn(() => <div>WatchEmptyState</div>),
}));

vi.mock('../../videos/video-card/skeleton', () => ({
  VideoSkeleton: vi.fn(() => <div>VideoSkeleton</div>),
}));

vi.mock('../../videos/video-card', () => ({
  VideoCard: vi.fn(() => <div>VideoCard</div>),
}));

vi.mock('../continue-watching', () => ({
  ContinueWatchingSection: vi.fn(() => <div>ContinueWatchingSection</div>),
}));

// Synchronous stand-in for the debounced search field so tests can drive the
// query directly.
vi.mock('../search', () => ({
  HomeSearch: ({ onQueryChange }: { onQueryChange: (q: string) => void }) => (
    <input
      aria-label="Search videos"
      onChange={(event) => onQueryChange(event.target.value)}
    />
  ),
}));

// Keep the real filterByTitle; only stub genlinkProps to avoid route generation.
vi.mock('../utils', async () => {
  const actual = await vi.importActual<typeof import('../utils')>('../utils');
  return {
    ...actual,
    genlinkProps: (video: { id: string; slug: string }) => ({
      to: '/video/$slug-$id',
      params: {
        slug: video.slug,
        id: video.id,
      },
    }),
  };
});

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
          continueWatching: [],
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
          continueWatching: [],
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

  it('should render the empty state when there are no videos', () => {
    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: [],
          continueWatching: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(WatchEmptyState).toHaveBeenCalled();
    expect(screen.queryByText('Videos')).not.toBeInTheDocument();
    expect(VideoCard).not.toHaveBeenCalled();
  });

  it('should not render the empty state while loading', () => {
    render(
      <HomeContainer
        queryRs={{
          isLoading: true,
          videos: [],
          continueWatching: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(WatchEmptyState).not.toHaveBeenCalled();
  });

  it('should pass continue-watching videos to ContinueWatchingSection', () => {
    const continueWatching = [{ id: '1', title: 'Video 1' }];

    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: [],
          continueWatching,
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(ContinueWatchingSection).toHaveBeenCalledWith(
      expect.objectContaining({
        videos: continueWatching,
        LinkComponent: MockLink,
      }),
      expect.anything(),
    );
  });

  it('filters the grid by the search query', () => {
    const mockVideos = [
      { id: '1', title: 'React Basics' },
      { id: '2', title: 'Vue Intro' },
    ];

    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: mockVideos,
          continueWatching: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).toHaveBeenCalledTimes(2);
    vi.mocked(VideoCard).mockClear();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search videos' }), {
      target: { value: 'vue' },
    });

    expect(VideoCard).toHaveBeenCalledTimes(1);
    expect(VideoCard).toHaveBeenCalledWith(
      expect.objectContaining({ video: mockVideos[1] }),
      expect.anything(),
    );
  });

  it('shows a no-results message when the query matches nothing', () => {
    render(
      <HomeContainer
        queryRs={{
          isLoading: false,
          videos: [{ id: '1', title: 'React Basics' }],
          continueWatching: [],
        }}
        LinkComponent={MockLink}
      />,
    );

    // Clear the initial (unfiltered) render before applying the query.
    vi.mocked(VideoCard).mockClear();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search videos' }), {
      target: { value: 'svelte' },
    });

    expect(screen.getByText(/No videos match/)).toBeInTheDocument();
    expect(VideoCard).not.toHaveBeenCalled();
  });
});
