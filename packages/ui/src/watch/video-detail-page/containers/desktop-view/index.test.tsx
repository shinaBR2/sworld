import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopView } from './index';
import { RelatedList } from '../../related-list';

vi.mock('../../../videos/video-container', () => ({
  VideoContainer: vi.fn(() => <div data-testid="video-container">Video Container</div>),
}));

vi.mock('../../related-list', () => ({
  RelatedList: vi.fn(() => <div data-testid="related-list">Related List</div>),
}));

const mockVideo = {
  id: '1',
  title: 'Test Video',
  thumbnailUrl: 'test.jpg',
  duration: '3:45',
  user: {
    username: 'testuser',
  },
};

const mockLinkComponent = ({ children }: { to: string; params: Record<string, string>; children: React.ReactNode }) => (
  <div data-testid="link-component">{children}</div>
);

describe('DesktopView', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <DesktopView
        queryRs={{
          videos: [],
          isLoading: true,
          videoDetail: null,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    expect(screen.getByLabelText('Loading video player')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading related videos')).toBeInTheDocument();
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
  });

  it('renders video content when not loading', () => {
    render(
      <DesktopView
        queryRs={{
          videos: [mockVideo],
          isLoading: false,
          videoDetail: mockVideo,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('passes correct props to RelatedList', () => {
    const mockVideos = [mockVideo];

    render(
      <DesktopView
        queryRs={{
          videos: mockVideos,
          isLoading: false,
          videoDetail: mockVideo,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    expect(vi.mocked(RelatedList)).toHaveBeenCalledWith(
      {
        videos: mockVideos,
        title: 'other videos',
        activeId: mockVideo.id,
        LinkComponent: mockLinkComponent,
      },
      {}
    );
  });
});
