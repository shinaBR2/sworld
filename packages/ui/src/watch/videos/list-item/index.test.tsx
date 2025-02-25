import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoListItem } from './index';

// Mock ResponsiveImage and other dependencies
vi.mock('../../../universal/images/image', () => ({
  ResponsiveImage: vi.fn(({ src, alt }) => <img src={src} alt={alt} data-testid="responsive-image" />),
}));

// Mock default thumbnail
vi.mock('../../../universal/images/default-thumbnail', () => ({
  defaultThumbnailUrl: 'default-thumbnail.jpg',
}));

describe('VideoListItem', () => {
  const mockVideo = {
    id: '1',
    title: 'Test Video',
    thumbnailUrl: 'test-thumbnail.jpg',
    duration: '3:45',
    user: { username: 'testuser' },
  };

  const mockLinkComponent = vi.fn(({ children, to, params }) => (
    <div data-testid="link-component" data-to={to} data-params={JSON.stringify(params)}>
      {children}
    </div>
  ));

  it('renders video details correctly', () => {
    render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} />);

    // Check video title
    const titleElement = screen.getByText('Test Video');
    expect(titleElement).toBeInTheDocument();

    // Check username
    const usernameElement = screen.getByText('testuser');
    expect(usernameElement).toBeInTheDocument();
  });

  it('passes correct link navigation props', () => {
    const linkProps = {
      to: '/$videoId',
      params: {
        videoId: '1',
      },
    };
    render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} linkProps={linkProps} />);

    const linkComponent = screen.getByTestId('link-component');
    expect(linkComponent).toHaveAttribute('data-to', '/$videoId');
    expect(linkComponent).toHaveAttribute('data-params', JSON.stringify({ videoId: '1' }));
  });

  it('renders thumbnail correctly', () => {
    render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} />);

    const thumbnailImage = screen.getByTestId('responsive-image');
    expect(thumbnailImage).toHaveAttribute('src', 'test-thumbnail.jpg');
    expect(thumbnailImage).toHaveAttribute('alt', 'Test Video');
  });

  it('uses default thumbnail when no thumbnail is provided', () => {
    const videoWithoutThumbnail = { ...mockVideo, thumbnailUrl: undefined };

    render(<VideoListItem video={videoWithoutThumbnail} LinkComponent={mockLinkComponent} />);

    const thumbnailImage = screen.getByRole('img');
    expect(thumbnailImage).toHaveAttribute('src', 'default-thumbnail.jpg');
  });

  it('handles active state with aria-current attribute', () => {
    const { rerender, container } = render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} />);

    const initialCurrentItems = document.querySelectorAll('[aria-current]');
    expect(initialCurrentItems).toHaveLength(0);

    // Rerender with active state
    rerender(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} isActive />);

    // Check active state
    const currentItems = container.querySelectorAll('[aria-current="page"]');
    expect(currentItems.length).toBe(1);
  });

  it('displays play icon', () => {
    render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} />);

    const playIcon = screen.getByTestId('PlayCircleIcon');
    expect(playIcon).toBeInTheDocument();
  });

  it('renders progress bar when progressSeconds and duration are provided', () => {
    const videoWithProgress = {
      ...mockVideo,
      progressSeconds: 100,
      duration: 200, // 50% progress
    };

    render(<VideoListItem video={videoWithProgress} LinkComponent={mockLinkComponent} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-label', 'Video progress');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('does not render progress bar when progressSeconds is 0', () => {
    const videoWithZeroProgress = {
      ...mockVideo,
      progressSeconds: 0,
      duration: 200,
    };

    render(<VideoListItem video={videoWithZeroProgress} LinkComponent={mockLinkComponent} />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('does not render progress bar when duration is missing', () => {
    const videoWithoutDuration = {
      ...mockVideo,
      progressSeconds: 100,
      duration: undefined,
    };

    render(<VideoListItem video={videoWithoutDuration} LinkComponent={mockLinkComponent} />);

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('calculates and displays correct progress percentage', () => {
    const testCases = [
      { progressSeconds: 25, duration: 100, expected: 25 }, // 25%
      { progressSeconds: 75, duration: 100, expected: 75 }, // 75%
      { progressSeconds: 100, duration: 100, expected: 100 }, // 100%
    ];

    testCases.forEach(({ progressSeconds, duration, expected }) => {
      const videoWithProgress = {
        ...mockVideo,
        progressSeconds,
        duration,
      };

      const { rerender } = render(<VideoListItem video={videoWithProgress} LinkComponent={mockLinkComponent} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', expected.toString());

      // Cleanup for next test case
      rerender(<div />);
    });
  });
});
