import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoCard } from './video-card';
import '@testing-library/jest-dom';

// Mock react-player
vi.mock('react-player', () => ({
  default: vi.fn(({ url, light }) => (
    <div data-testid="mock-react-player" data-url={url} data-light={light}>
      Mock Player
    </div>
  )),
}));

describe('VideoCard Component', () => {
  const mockVideo = {
    id: '1',
    title: 'Test Video',
    source: 'https://example.com/video.mp4',
    thumbnail: 'https://example.com/thumbnail.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    duration: '5:30',
    user: {
      username: 'testuser',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video information correctly', () => {
    render(<VideoCard video={mockVideo} />);

    // Check if title is rendered
    expect(screen.getByText('Test Video')).toBeInTheDocument();

    // Check if username and date are rendered
    expect(screen.getByText('testuser • 2024-01-01')).toBeInTheDocument();

    // Check if duration is rendered
    expect(screen.getByText('5:30')).toBeInTheDocument();
  });

  it('uses default thumbnail when thumbnail prop is not provided', () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnail: undefined,
    };

    render(<VideoCard video={videoWithoutThumbnail} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player.getAttribute('data-light')).toContain('data:image/svg+xml');
  });

  it('renders with provided thumbnail', () => {
    render(<VideoCard video={mockVideo} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player.getAttribute('data-light')).toBe(
      'https://example.com/thumbnail.jpg'
    );
  });

  it('handles video without duration', () => {
    const videoWithoutDuration = {
      ...mockVideo,
      duration: undefined,
    };

    render(<VideoCard video={videoWithoutDuration} />);

    // Duration element should not be present
    const durationElements = screen.queryByText(/^\d+:\d+$/);
    expect(durationElements).not.toBeInTheDocument();
  });

  it('renders ReactPlayer with correct props', () => {
    render(<VideoCard video={mockVideo} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toBeInTheDocument();
    expect(player.getAttribute('data-url')).toBe(
      'https://example.com/video.mp4'
    );
  });

  it('truncates long titles properly', () => {
    const videoWithLongTitle = {
      ...mockVideo,
      title:
        'This is a very long title that should be truncated because it exceeds the maximum length allowed for the card title display area',
    };

    render(<VideoCard video={videoWithLongTitle} />);

    const titleElement = screen.getByText(videoWithLongTitle.title);
    expect(titleElement).toHaveStyle({
      WebkitLineClamp: '2',
      overflow: 'hidden',
      display: '-webkit-box',
    });
  });
});
