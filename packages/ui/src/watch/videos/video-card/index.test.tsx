import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { VideoCard } from '.';
import '@testing-library/jest-dom';

// Mock react-player
vi.mock('react-player', () => ({
  default: vi.fn(({ url, light }) => (
    <div data-testid="mock-react-player" data-url={url} data-light={light}>
      Mock Player
    </div>
  )),
}));

const renderWithAct = async (component: React.ReactElement) => {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(component);
  });
  return result!;
};

describe('VideoCard Component', () => {
  const mockVideo = {
    id: '1',
    title: 'Test Video',
    source: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    duration: 300,
    progressSeconds: 0,
    user: {
      username: 'testuser',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video information correctly', async () => {
    await renderWithAct(<VideoCard video={mockVideo} />);

    // Check if title is rendered
    expect(screen.getByText('Test Video')).toBeInTheDocument();

    // Check if username and date are rendered
    expect(screen.getByText('testuser • 2024-01-01')).toBeInTheDocument();
  });

  it('uses default thumbnail when thumbnail prop is not provided', async () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnailUrl: undefined,
    };

    await renderWithAct(<VideoCard video={videoWithoutThumbnail} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player.getAttribute('data-light')).toContain('data:image/svg+xml');
  });

  it('renders with provided thumbnail', async () => {
    await renderWithAct(<VideoCard video={mockVideo} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player.getAttribute('data-light')).toBe('https://example.com/thumbnail.jpg');
  });

  it('handles video without duration', async () => {
    const videoWithoutDuration = {
      ...mockVideo,
      duration: undefined,
    };

    await renderWithAct(<VideoCard video={videoWithoutDuration} />);

    // Duration element should not be present
    const durationElements = screen.queryByText(/^\d+:\d+$/);
    expect(durationElements).not.toBeInTheDocument();
  });

  it('renders ReactPlayer with correct props', async () => {
    await renderWithAct(<VideoCard video={mockVideo} />);

    const player = screen.getByTestId('mock-react-player');
    expect(player).toBeInTheDocument();
    expect(player.getAttribute('data-url')).toBe('https://example.com/video.mp4');
  });

  it('truncates long titles properly', async () => {
    const videoWithLongTitle = {
      ...mockVideo,
      title:
        'This is a very long title that should be truncated because it exceeds the maximum length allowed for the card title display area',
    };

    await renderWithAct(<VideoCard video={videoWithLongTitle} />);

    const titleElement = screen.getByText(videoWithLongTitle.title);
    expect(titleElement).toHaveStyle({
      WebkitLineClamp: '2',
      overflow: 'hidden',
      display: '-webkit-box',
    });
  });

  it('does not render progress bar when progressSeconds is 0', async () => {
    const videoWithNoProgress = { ...mockVideo, progressSeconds: 0 };
    await renderWithAct(<VideoCard video={videoWithNoProgress} asLink />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).toBeNull();
  });

  it('renders progress bar with correct width when progressSeconds is set', async () => {
    const videoWithProgress = { ...mockVideo, progressSeconds: 150 }; // Halfway through
    await renderWithAct(<VideoCard video={videoWithProgress} asLink />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeNull();

    // Check aria-valuenow for percentage
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders progress bar with 100% width when progressSeconds equals duration', async () => {
    const videoFullyWatched = { ...mockVideo, progressSeconds: 300 }; // Full duration
    await renderWithAct(<VideoCard video={videoFullyWatched} asLink />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeNull();

    // Check aria-valuenow for percentage
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('does not render progress bar when duration is not provided', async () => {
    const videoWithoutDuration = {
      ...mockVideo,
      duration: undefined,
      progressSeconds: 150,
    };
    await renderWithAct(<VideoCard video={videoWithoutDuration} asLink />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).toBeNull();
  });
});
