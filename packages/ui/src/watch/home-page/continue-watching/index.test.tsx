import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoCard } from '../../videos/video-card';
import { ContinueWatchingSection } from './index';
import type { ContinueWatchingItem } from './types';

// Controls the breakpoint: when true every breakpoints.up() matches → xl (5
// columns); when false none match → xs (1 column).
let matchesBreakpoints = false;
vi.mock('@mui/material/useMediaQuery', () => ({
  default: () => matchesBreakpoints,
}));

vi.mock('../../videos/video-card', () => ({
  VideoCard: vi.fn(() => <div>VideoCard</div>),
}));

vi.mock('./utils', () => ({
  genlinkProps: (item: { id: string; slug: string }) => ({
    to: '/video/$slug/$id',
    params: { slug: item.slug, id: item.id },
  }),
}));

const MockLink = vi.fn(({ to, children }) => <a href={to}>{children}</a>);

const makeItem = (index: number): ContinueWatchingItem => ({
  id: `video-${index}`,
  type: 'video',
  title: `Video ${index}`,
  thumbnailUrl: '',
  source: '',
  slug: `video-${index}`,
  duration: 600,
  createdAt: '2024-12-15T04:32:47.424952+00:00',
  user: { username: 'shinabr2' },
  progressSeconds: 120,
  lastWatchedAt: '2026-06-29T10:00:00.000000+00:00',
});

describe('ContinueWatchingSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchesBreakpoints = false;
  });

  it('renders the heading and a "Show all" link to history', () => {
    render(
      <ContinueWatchingSection
        videos={[makeItem(1)]}
        LinkComponent={MockLink}
      />,
    );

    expect(screen.getByText('Continue watching')).toBeInTheDocument();
    expect(screen.getByText('Show all')).toBeInTheDocument();
    expect(MockLink).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/history' }),
      expect.anything(),
    );
  });

  it('slices to one card at the smallest breakpoint', () => {
    matchesBreakpoints = false;

    render(
      <ContinueWatchingSection
        videos={Array.from({ length: 8 }, (_, i) => makeItem(i + 1))}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).toHaveBeenCalledTimes(1);
  });

  it('slices to five cards at the largest breakpoint', () => {
    matchesBreakpoints = true;

    render(
      <ContinueWatchingSection
        videos={Array.from({ length: 8 }, (_, i) => makeItem(i + 1))}
        LinkComponent={MockLink}
      />,
    );

    expect(VideoCard).toHaveBeenCalledTimes(5);
  });

  it('renders nothing when there are no videos', () => {
    const { container } = render(
      <ContinueWatchingSection videos={[]} LinkComponent={MockLink} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(VideoCard).not.toHaveBeenCalled();
  });
});
