import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import {
  generateVideoDetailRoute,
  generateVideoInPlaylistRoute,
} from 'core/watch/routes';
import { RelatedList } from './index';

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
const MockLinkComponent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('RelatedList', () => {
  const mockVideos = [
    {
      id: '1',
      type: 'video' as const,
      title: 'First Video',
      slug: 'first-video',
      description: 'First video description',
      thumbnailUrl: 'first.jpg',
      source: 'https://example.com/video1.mp4',
      duration: 225,
      createdAt: '2023-01-01',
      user: { username: 'user1' },
      lastWatchedAt: null,
      progressSeconds: 0,
      subtitles: [
        {
          id: '1',
          label: 'English',
          lang: 'en',
          src: 'https://example.com/sub1.vtt',
          isDefault: true,
        },
      ],
    },
    {
      id: '2',
      type: 'video' as const,
      title: 'Second Video',
      slug: 'second-video',
      description: 'Second video description',
      thumbnailUrl: 'second.jpg',
      source: 'https://example.com/video2.mp4',
      duration: 150,
      createdAt: '2023-01-02',
      user: { username: 'user2' },
      lastWatchedAt: null,
      progressSeconds: 0,
      subtitles: [
        {
          id: '1',
          label: 'English',
          lang: 'en',
          src: 'https://example.com/sub2.vtt',
          isDefault: true,
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the default title when no title prop is provided', () => {
    render(
      <RelatedList videos={mockVideos} LinkComponent={MockLinkComponent} />,
    );

    const titleElement = screen.getByText('Related videos');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(
      <RelatedList
        videos={mockVideos}
        title="Custom Title"
        LinkComponent={MockLinkComponent}
      />,
    );

    const titleElement = screen.getByText('Custom Title');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders correct number of VideoListItems', () => {
    render(
      <RelatedList videos={mockVideos} LinkComponent={MockLinkComponent} />,
    );

    const videoItems = screen.getAllByTestId('video-list-item');
    expect(videoItems.length).toBe(mockVideos.length);
  });

  it('passes correct props to VideoListItem', () => {
    const activeId = '1';
    render(
      <RelatedList
        videos={mockVideos}
        activeId={activeId}
        LinkComponent={MockLinkComponent}
      />,
    );

    const videoItems = screen.getAllByTestId('video-list-item');

    videoItems.forEach((item, index) => {
      const video = mockVideos[index];
      expect(item).toHaveAttribute('data-video-id', video.id);
      expect(item).toHaveAttribute(
        'data-is-active',
        `${video.id === activeId}`,
      );
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
      __typename: 'playlist' as const,
      id: 'playlist-1',
      title: 'Test Playlist',
      slug: 'test-playlist',
      createdAt: '2023-01-01',
      description: 'Test playlist description',
      thumbnailUrl: 'https://example.com/playlist.jpg',
      user: { __typename: 'users' as const },
      playlist_videos: [],
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

    render(
      <RelatedList
        videos={[mockVideos[0]]}
        playlist={mockPlaylist}
        LinkComponent={MockLinkComponent}
      />,
    );

    const videoItem = screen.getByTestId('video-list-item');
    expect(JSON.parse(videoItem.dataset.linkProps || '{}')).toEqual(
      mockLinkProps,
    );
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

    render(
      <RelatedList
        videos={[mockVideos[0]]}
        playlist={null}
        LinkComponent={MockLinkComponent}
      />,
    );

    const videoItem = screen.getByTestId('video-list-item');
    expect(JSON.parse(videoItem.dataset.linkProps || '{}')).toEqual(
      mockLinkProps,
    );
    expect(generateVideoDetailRoute).toHaveBeenCalledWith({
      id: mockVideos[0].id,
      slug: mockVideos[0].slug,
    });
  });

  it('should render auto-play checkbox when onAutoPlayChange is provided', () => {
    const onAutoPlayChange = vi.fn();
    render(
      <RelatedList
        videos={mockVideos}
        LinkComponent={MockLinkComponent}
        autoPlay={true}
        onAutoPlayChange={onAutoPlayChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /auto-play next video/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it('should handle auto-play toggle', () => {
    const onAutoPlayChange = vi.fn();
    render(
      <RelatedList
        videos={mockVideos}
        LinkComponent={MockLinkComponent}
        autoPlay={true}
        onAutoPlayChange={onAutoPlayChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /auto-play next video/i,
    });
    checkbox.click();

    expect(onAutoPlayChange).toHaveBeenCalledWith(false);
  });

  it('should not render auto-play checkbox when onAutoPlayChange is not provided', () => {
    render(
      <RelatedList
        videos={mockVideos}
        LinkComponent={MockLinkComponent}
        autoPlay={true}
      />,
    );

    const checkbox = screen.queryByRole('checkbox', {
      name: /auto-play next video/i,
    });
    expect(checkbox).not.toBeInTheDocument();
  });
});
