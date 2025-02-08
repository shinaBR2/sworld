import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopView } from './index';
import { RelatedList } from '../../related-list';

// Mocks must be defined before any imports
vi.mock('../../../videos/video-player', () => ({
  VideoPlayer: vi.fn(() => <div data-testid="video-player">Video Player</div>),
}));

vi.mock('../../related-list', () => ({
  RelatedList: vi.fn(() => <div data-testid="related-list">Related List</div>),
}));

// Mock data
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
    const { container } = render(
      <DesktopView
        queryRs={{
          videos: [],
          isLoading: true,
          videoDetail: null,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    // Check for skeleton elements
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);

    // Ensure no actual content is rendered
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    expect(screen.queryByTestId('related-list')).not.toBeInTheDocument();
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

    // Check for main components
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByTestId('related-list')).toBeInTheDocument();

    // Check video title
    const titleElement = screen.getByText('Test Video');
    expect(titleElement).toBeInTheDocument();
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

    // Verify RelatedList is called with correct props
    const relatedListMock = vi.mocked(RelatedList);
    expect(relatedListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        videos: mockVideos,
        title: 'other videos',
        activeId: mockVideo.id,
      }),
      {}
    );
  });
});
