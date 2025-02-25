import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RelatedList } from './index';
import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from 'core/watch/routes';

// Mock the VideoListItem component
vi.mock('../../videos/list-item', () => ({
  VideoListItem: vi.fn(({ video, isActive, linkProps }) => (
    <div
      data-testid="video-list-item"
      data-video-id={video.id}
      data-is-active={isActive}
      data-link-props={JSON.stringify(linkProps)}
    >
      {video.title}
    </div>
  )),
}));

vi.mock('core/watch/routes', () => ({
  generateVideoDetailRoute: vi.fn(),
  generateVideoInPlaylistRoute: vi.fn(),
}));

// Mock Link component
const MockLinkComponent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

describe('RelatedList', () => {
  const mockVideos = [
    {
      id: '1',
      title: 'First Video',
      slug: 'first-video',
      thumbnailUrl: 'first.jpg',
      user: { username: 'user1' },
      duration: '3:45',
    },
    {
      id: '2',
      title: 'Second Video',
      slug: 'second-video',
      thumbnailUrl: 'second.jpg',
      user: { username: 'user2' },
      duration: '2:30',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the default title when no title prop is provided', () => {
    render(<RelatedList videos={mockVideos} LinkComponent={MockLinkComponent} />);

    const titleElement = screen.getByText('Related videos');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<RelatedList videos={mockVideos} title="Custom Title" LinkComponent={MockLinkComponent} />);

    const titleElement = screen.getByText('Custom Title');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders correct number of VideoListItems', () => {
    render(<RelatedList videos={mockVideos} LinkComponent={MockLinkComponent} />);

    const videoItems = screen.getAllByTestId('video-list-item');
    expect(videoItems.length).toBe(mockVideos.length);
  });

  it('passes correct props to VideoListItem', () => {
    const activeId = '1';
    render(<RelatedList videos={mockVideos} activeId={activeId} LinkComponent={MockLinkComponent} />);

    const videoItems = screen.getAllByTestId('video-list-item');

    videoItems.forEach((item, index) => {
      const video = mockVideos[index];
      expect(item).toHaveAttribute('data-video-id', video.id);
      expect(item).toHaveAttribute('data-is-active', `${video.id === activeId}`);
    });
  });

  it('renders empty list when no videos are provided', () => {
    render(<RelatedList videos={[]} LinkComponent={MockLinkComponent} />);

    const titleElement = screen.getByText('Related videos');
    expect(titleElement).toBeInTheDocument();

    const videoItems = screen.queryAllByTestId('video-list-item');
    expect(videoItems.length).toBe(0);
  });

  it('should generate playlist route when playlist is provided', () => {
    const mockPlaylist = {
      id: 'playlist-1',
      slug: 'test-playlist',
    };

    const mockLinkProps = {
      to: '/playlist/$playlistSlug-$playlistId/video/$videoId',
      params: {
        playlistId: 'playlist-1',
        videoId: 'video-1',
        slug: 'test-playlist',
      },
    };

    vi.mocked(generateVideoInPlaylistRoute).mockReturnValue(mockLinkProps);

    render(<RelatedList videos={[mockVideos[0]]} playlist={mockPlaylist} LinkComponent={MockLinkComponent} />);

    const videoItem = screen.getByTestId('video-list-item');
    expect(JSON.parse(videoItem.dataset.linkProps || '{}')).toEqual(mockLinkProps);
    expect(generateVideoInPlaylistRoute).toHaveBeenCalledWith({
      playlistId: mockPlaylist.id,
      playlistSlug: mockPlaylist.slug,
      videoId: mockVideos[0].id,
    });
  });

  it('should generate video route when playlist is not provided', () => {
    const mockLinkProps = {
      to: '/video/$slug-$id',
      params: {
        id: 'video-1',
        slug: 'test-video',
      },
    };

    vi.mocked(generateVideoDetailRoute).mockReturnValue(mockLinkProps);

    render(<RelatedList videos={[mockVideos[0]]} playlist={null} LinkComponent={MockLinkComponent} />);

    const videoItem = screen.getByTestId('video-list-item');
    expect(JSON.parse(videoItem.dataset.linkProps || '{}')).toEqual(mockLinkProps);
    expect(generateVideoDetailRoute).toHaveBeenCalledWith({ id: mockVideos[0].id, slug: mockVideos[0].slug });
  });
});
