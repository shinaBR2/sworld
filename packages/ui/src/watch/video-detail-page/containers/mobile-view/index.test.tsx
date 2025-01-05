import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileView } from './index';
import { Video } from '../../../videos/interface';

// Mock components and constants
vi.mock('../../../videos/video-player', () => ({
  VideoPlayer: ({ video }: { video: Video }) => (
    <div data-testid="video-player">{video.id}</div>
  ),
}));

vi.mock('../../related-list', () => ({
  RelatedList: ({ videos }: { videos: Video[] }) => (
    <div data-testid="related-list">
      {videos.map(v => (
        <div key={v.id}>{v.id}</div>
      ))}
    </div>
  ),
}));

const mockVideos = [{ id: 'video1' }, { id: 'video2' }, { id: 'video3' }];

const mockProps = {
  queryRs: {
    videos: mockVideos,
    isLoading: false,
  },
  LinkComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
};

describe('MobileView', () => {
  it('maintains 16:9 aspect ratio for video player', () => {
    render(<MobileView {...mockProps} />);

    const videoContainer = screen.getByTestId('video-player').parentElement;
    const styles = window.getComputedStyle(videoContainer!);

    expect(styles.height).toBe('56.25vw');
  });

  it('scrollable list takes remaining space correctly', () => {
    render(<MobileView {...mockProps} />);

    const listContainer = screen.getByTestId('related-list').parentElement;
    const styles = window.getComputedStyle(listContainer!);

    expect(styles.height).toBe('calc(100vh - 56.25vw - 56px)');
    expect(styles.overflow).toBe('auto');
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <MobileView
        {...mockProps}
        queryRs={{ ...mockProps.queryRs, isLoading: true }}
      />
    );

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders video player with first video', () => {
    render(<MobileView {...mockProps} />);

    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toHaveTextContent('video1');
  });

  it('renders related list with all videos', () => {
    render(<MobileView {...mockProps} />);

    const relatedList = screen.getByTestId('related-list');
    mockVideos.forEach(video => {
      expect(relatedList).toHaveTextContent(video.id);
    });
  });

  it('maintains layout structure even with long content', () => {
    const lotsOfVideos = Array(20)
      .fill(null)
      .map((_, i) => ({
        id: `video${i}`,
      }));

    render(
      <MobileView
        {...mockProps}
        queryRs={{ ...mockProps.queryRs, videos: lotsOfVideos }}
      />
    );

    const listContainer = screen.getByTestId('related-list').parentElement;
    const styles = window.getComputedStyle(listContainer!);

    expect(styles.height).toBe('calc(100vh - 56.25vw - 56px)');
    expect(styles.overflow).toBe('auto');
  });
});
