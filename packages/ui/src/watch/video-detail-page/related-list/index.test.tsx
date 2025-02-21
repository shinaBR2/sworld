import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RelatedList } from './index';

// Mock the VideoListItem component
vi.mock('../../videos/list-item', () => ({
  VideoListItem: vi.fn(({ video, isActive }) => (
    <div data-testid="video-list-item" data-video-id={video.id} data-is-active={isActive}>
      {video.title}
    </div>
  )),
}));

// Mock Link component
const MockLinkComponent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

describe('RelatedList', () => {
  const mockVideos = [
    {
      id: '1',
      title: 'First Video',
      thumbnailUrl: 'first.jpg',
      user: { username: 'user1' },
      duration: '3:45',
    },
    {
      id: '2',
      title: 'Second Video',
      thumbnailUrl: 'second.jpg',
      user: { username: 'user2' },
      duration: '2:30',
    },
  ];

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
});
