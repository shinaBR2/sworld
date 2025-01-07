import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileView } from './index';
import { Video } from '../../../videos/interface';
import { VIDEO_ASPECT_RATIO, HEADER_MOBILE_HEIGHT } from '../../../theme';

// Mock Material-UI components
vi.mock('@mui/material/Grid', () => ({
  default: ({ children, sx, container, item, direction }: any) => (
    <div
      data-testid="mui-grid"
      data-sx={JSON.stringify(sx)}
      data-container={container}
      data-item={item}
      data-direction={direction}
    >
      {children}
    </div>
  ),
}));

vi.mock('@mui/material/Skeleton', () => ({
  default: ({ variant, width, height, animation, sx }: any) => (
    <div
      data-testid="mui-skeleton"
      className="MuiSkeleton-root"
      data-variant={variant}
      data-width={width}
      data-height={height}
      data-animation={animation}
      data-sx={JSON.stringify(sx)}
    />
  ),
}));

vi.mock('@mui/material/Box', () => ({
  default: ({ children, sx }: never) => (
    <div data-testid="mui-box" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
}));

// Mock components
vi.mock('../../../videos/video-player', () => ({
  VideoPlayer: ({ video }: { video: Video }) => (
    <div data-testid="video-player">{video.id}</div>
  ),
}));

vi.mock('../../related-list', () => ({
  RelatedList: ({
    videos,
    title,
  }: {
    videos: Video[];
    title: string;
    LinkComponent: unknown;
  }) => (
    <div data-testid="related-list" data-title={title}>
      {videos.map(v => (
        <div key={v.id}>{v.id}</div>
      ))}
    </div>
  ),
}));

vi.mock('../../../videos/list-item-skeleton', () => ({
  VideoListItemSkeleton: () => <div data-testid="video-list-item-skeleton" />,
}));

const mockVideos = [
  { id: 'video1', title: 'Video 1' },
  { id: 'video2', title: 'Video 2' },
  { id: 'video3', title: 'Video 3' },
];

const mockVideoDetail = { id: 'detail1', title: 'Detail Video' };

const mockProps = {
  queryRs: {
    videos: mockVideos,
    videoDetail: mockVideoDetail,
    isLoading: false,
  },
  LinkComponent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="link-component">{children}</div>
  ),
};

describe('MobileView', () => {
  it('maintains correct video container height', () => {
    render(<MobileView {...mockProps} />);
    const gridElements = screen.getAllByTestId('mui-grid');
    const videoContainer = gridElements[1]; // Second Grid element is video container

    const sx = JSON.parse(videoContainer.dataset.sx || '{}');
    expect(sx.height).toBe(VIDEO_ASPECT_RATIO);
  });

  it('maintains correct scrollable list styles', () => {
    render(<MobileView {...mockProps} />);
    const gridElements = screen.getAllByTestId('mui-grid');
    const listContainer = gridElements[2]; // Third Grid element is list container

    const sx = JSON.parse(listContainer.dataset.sx || '{}');
    expect(sx.overflow).toBe('auto');
    expect(sx.height).toBe(
      `calc(100vh - ${VIDEO_ASPECT_RATIO} - ${HEADER_MOBILE_HEIGHT}px)`
    );
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <MobileView
        {...mockProps}
        queryRs={{ ...mockProps.queryRs, isLoading: true }}
      />
    );

    expect(screen.getAllByTestId('video-list-item-skeleton')).toHaveLength(5);
    expect(screen.getByTestId('mui-skeleton')).toBeInTheDocument();
  });

  it('renders video player with correct video detail', () => {
    render(<MobileView {...mockProps} />);

    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toHaveTextContent(mockVideoDetail.id);
  });

  it('renders related list with correct props', () => {
    render(<MobileView {...mockProps} />);

    const relatedList = screen.getByTestId('related-list');
    expect(relatedList).toHaveAttribute('data-title', 'other videos');
    mockVideos.forEach(video => {
      expect(relatedList).toHaveTextContent(video.id);
    });
  });

  it('maintains correct container styles', () => {
    render(<MobileView {...mockProps} />);

    const container = screen.getAllByTestId('mui-grid')[0];
    const sx = JSON.parse(container.dataset.sx || '{}');

    expect(sx.flex).toBe(1);
    expect(sx.minHeight).toBe(0);
  });
});
