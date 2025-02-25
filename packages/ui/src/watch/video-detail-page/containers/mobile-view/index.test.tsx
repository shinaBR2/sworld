import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileView } from './index';
import { RelatedList } from '../../related-list';
import { TransformedVideo } from 'core/watch/query-hooks';

// Mock components
vi.mock('../../../videos/video-container', () => ({
  VideoContainer: ({ video, onError }: { video: TransformedVideo; onError: (err: unknown) => void }) => (
    <div data-testid="video-container" onClick={() => onError(new Error('test error'))}>
      {video.id}
    </div>
  ),
}));

vi.mock('../../related-list', () => ({
  RelatedList: vi.fn(({ videos, title }: { videos: TransformedVideo[]; title: string; LinkComponent: unknown }) => (
    <div data-testid="related-list" data-title={title}>
      {videos.map(v => (
        <div key={v.id}>{v.id}</div>
      ))}
    </div>
  )),
}));

vi.mock('../../../videos/list-item/skeleton', () => ({
  VideoListItemSkeleton: () => <div data-testid="video-list-item-skeleton" />,
}));

const mockVideos = [
  { id: 'video1', title: 'Video 1' },
  { id: 'video2', title: 'Video 2' },
  { id: 'video3', title: 'Video 3' },
];

const mockVideoDetail = mockVideos[0];

const mockProps = {
  queryRs: {
    videos: mockVideos,
    isLoading: false,
  },
  activeVideoId: mockVideos[0].id,
  LinkComponent: ({ children }: { children: React.ReactNode }) => <div data-testid="link-component">{children}</div>,
};

describe('MobileView', () => {
  it('renders nothing when invalid data', () => {
    const { container } = render(
      <MobileView
        {...mockProps}
        activeVideoId="not-exist-id" // Not in the videos list
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders video container with correct video', () => {
    render(<MobileView {...mockProps} />);
    expect(screen.getByTestId('video-container')).toHaveTextContent(mockVideoDetail.id);
  });

  it('renders title correctly', () => {
    render(<MobileView {...mockProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockVideoDetail.title);
  });

  it('handles long title without breaking', () => {
    const longTitle = 'Very '.repeat(50) + 'long title';
    render(
      <MobileView
        {...mockProps}
        queryRs={{
          ...mockProps.queryRs,
          videos: [...mockVideos, { id: 'video-4', title: longTitle }],
        }}
        activeVideoId="video-4"
      />
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longTitle);
  });

  it('renders related videos list', () => {
    render(<MobileView {...mockProps} />);
    const relatedList = screen.getByTestId('related-list');
    expect(relatedList).toHaveAttribute('data-title', 'other videos');

    mockVideos.forEach(video => {
      expect(relatedList).toHaveTextContent(video.id);
    });
  });

  it('shows loading skeletons when in loading state', () => {
    render(<MobileView {...mockProps} queryRs={{ ...mockProps.queryRs, isLoading: true }} />);

    const skeletons = screen.getAllByTestId('video-list-item-skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('shows content when not in loading state', () => {
    render(<MobileView {...mockProps} />);

    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
    expect(screen.queryByTestId('video-list-item-skeleton')).not.toBeInTheDocument();
  });

  it('passes correct props to RelatedList', () => {
    render(<MobileView {...mockProps} />);

    // Verify RelatedList is called with correct props
    const relatedListMock = vi.mocked(RelatedList);
    expect(relatedListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        videos: mockVideos,
        title: 'other videos',
        activeId: mockVideoDetail.id,
      }),
      {}
    );
  });
});
