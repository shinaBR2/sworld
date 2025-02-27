// src/components/video-detail-page/containers/index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoDetailContainer } from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock dependencies
vi.mock('./skeleton', () => ({
  MainContentSkeleton: () => <div data-testid="main-content-skeleton" />,
  RelatedContentSkeleton: () => <div data-testid="related-content-skeleton" />,
}));

// Create VideoContainer mock with a mock implementation
const mockVideoContainer = vi
  .fn()
  .mockImplementation(({ video }) => <div data-testid="video-container">{video.title}</div>);

// Mock the VideoContainer module
vi.mock('../../videos/video-container', () => ({
  VideoContainer: props => mockVideoContainer(props),
}));

vi.mock('../related-list', () => ({
  RelatedList: ({ title, videos }) => (
    <div data-testid="related-list">
      <div data-testid="related-list-title">{title}</div>
      <div data-testid="related-list-count">{videos.length}</div>
    </div>
  ),
}));

vi.mock('./styled', () => ({
  StyledRelatedContainer: ({ children }) => <div data-testid="styled-related-container">{children}</div>,
}));

const mockLinkComponent = ({ to, children }) => <a href={to}>{children}</a>;

const theme = createTheme();
const renderWithTheme = ui => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('VideoDetailContainer', () => {
  const mockVideos = [
    { id: 'video1', title: 'Video 1', url: 'https://example.com/video1' },
    { id: 'video2', title: 'Video 2', url: 'https://example.com/video2' },
    { id: 'video3', title: 'Video 3', url: 'https://example.com/video3' },
  ];

  const defaultProps = {
    activeVideoId: 'video1',
    queryRs: {
      isLoading: false,
      videos: mockVideos,
      playlist: null,
    },
    LinkComponent: mockLinkComponent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVideoContainer.mockImplementation(({ video }) => <div data-testid="video-container">{video.title}</div>);
  });

  it('should render loading skeletons when isLoading is true', () => {
    const loadingProps = {
      ...defaultProps,
      queryRs: {
        ...defaultProps.queryRs,
        isLoading: true,
      },
    };

    renderWithTheme(<VideoDetailContainer {...loadingProps} />);

    expect(screen.getByTestId('main-content-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('related-content-skeleton')).toBeInTheDocument();
  });

  it('should render video content and related list when data is loaded', () => {
    renderWithTheme(<VideoDetailContainer {...defaultProps} />);

    // Main content checks
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Video 1');
    expect(screen.getByTestId('video-container')).toHaveTextContent('Video 1');

    // Related content checks
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
    expect(screen.getByTestId('related-list-title')).toHaveTextContent('Other videos');
    expect(screen.getByTestId('related-list-count')).toHaveTextContent('3');
  });

  it('should display "Same playlist" when playlist is provided', () => {
    const playlistProps = {
      ...defaultProps,
      queryRs: {
        ...defaultProps.queryRs,
        playlist: { id: 'playlist1', title: 'My Playlist' },
      },
    };

    renderWithTheme(<VideoDetailContainer {...playlistProps} />);

    expect(screen.getByTestId('related-list-title')).toHaveTextContent('Same playlist');
  });

  it('should return null in MainContent when video is not found', () => {
    const noVideoProps = {
      ...defaultProps,
      activeVideoId: 'nonexistent',
    };

    renderWithTheme(<VideoDetailContainer {...noVideoProps} />);

    // The component should return null for the main content
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('should return null in RelatedContent when video is not found', () => {
    const noVideoProps = {
      ...defaultProps,
      activeVideoId: 'nonexistent',
    };

    renderWithTheme(<VideoDetailContainer {...noVideoProps} />);

    // The component should return null for the related content
    expect(screen.queryByTestId('related-list')).not.toBeInTheDocument();
  });

  it('should handle onError in VideoContainer', () => {
    // Create a spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Update the mockVideoContainer implementation to simulate an error
    mockVideoContainer.mockImplementation(({ onError }) => {
      // Simulate an error
      onError(new Error('Test error'));
      return <div data-testid="video-container">Video with error</div>;
    });

    renderWithTheme(<VideoDetailContainer {...defaultProps} />);

    // Verify the error handler was called
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    // Clean up
    consoleSpy.mockRestore();
  });
});
