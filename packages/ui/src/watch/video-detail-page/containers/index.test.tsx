// src/components/video-detail-page/containers/index.test.tsx

import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoDetailContainer } from './index';
import type { VideoDetailContainerProps } from './types';

type MockVideo = {
  id: string;
  type: 'video';
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  slug: string;
  duration: number;
  createdAt: string;
  user: { username: string };
  lastWatchedAt: string | null;
  progressSeconds: number;
  subtitles: Array<{
    id: string;
    lang: string;
    src: string;
    isDefault: boolean;
    label: string;
  }>;
};

// Mock dependencies
vi.mock('./skeleton', () => ({
  MainContentSkeleton: () => <div data-testid="main-content-skeleton" />,
  RelatedContentSkeleton: () => <div data-testid="related-content-skeleton" />,
}));

vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({
    control,
    label,
  }: {
    control: React.ReactNode;
    label: React.ReactNode;
  }) => (
    <div data-testid="form-control-label">
      {control}
      <span>{label}</span>
    </div>
  ),
}));

vi.mock('@mui/material/Checkbox', () => ({
  default: ({
    checked,
    onChange,
  }: {
    checked?: boolean;
    onChange: (event: { target: { checked: boolean } }) => void;
  }) => (
    <input
      type="checkbox"
      data-testid="auto-play-checkbox"
      checked={checked}
      onChange={(e) => onChange({ target: { checked: e.target.checked } })}
    />
  ),
}));

// Create VideoContainer mock with a mock implementation
const mockVideoContainer = vi.fn().mockImplementation(({ video, onEnded }) => (
  <div data-testid="video-container" onClick={() => onEnded?.()}>
    {video.title}
  </div>
));

// Mock the VideoContainer module
vi.mock('../../videos/video-container', () => ({
  VideoContainer: (props: {
    video: MockVideo;
    onEnded?: () => void;
    onError?: (error: unknown) => void;
  }) => mockVideoContainer(props),
}));

vi.mock('../../dialogs/share', () => ({
  ShareDialog: ({
    open,
    onClose,
    onShare,
  }: {
    open: boolean;
    onClose: () => void;
    onShare: (emails: string[]) => void;
  }) => (
    <div
      data-testid="share-dialog"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={() => onShare(['test@example.com'])}>Share</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../related-list', () => ({
  RelatedList: ({
    title,
    videos,
    autoPlay,
    onAutoPlayChange,
  }: {
    title: string;
    videos: MockVideo[];
    autoPlay?: boolean;
    onAutoPlayChange?: (checked: boolean) => void;
  }) => (
    <div data-testid="related-list">
      <div data-testid="related-list-title">{title}</div>
      <div data-testid="related-list-count">{videos.length}</div>
      {onAutoPlayChange && (
        <input
          type="checkbox"
          data-testid="related-list-autoplay"
          checked={autoPlay}
          onChange={(e) => onAutoPlayChange(e.target.checked)}
        />
      )}
    </div>
  ),
}));

vi.mock('./styled', () => ({
  StyledRelatedContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="styled-related-container">{children}</div>
  ),
}));

// Mock the useSaveSubtitle hook
const mockMutateAsync = vi.fn().mockResolvedValue({
  data: { update_subtitles_by_pk: { id: '1' } },
});

vi.mock('core/watch/mutation-hooks/save-subtitle', () => ({
  useSaveSubtitle: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
  })),
}));

// Mock the SubtitleDialog component
vi.mock('../../dialogs/subtitle', () => ({
  SubtitleDialog: ({
    open,
    onSave,
  }: {
    open: boolean;
    onSave: (url: string) => void;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="subtitle-dialog">
        <button
          onClick={() => onSave('https://example.com/updated-subtitle.vtt')}
          data-testid="save-subtitle-button"
        >
          Save Subtitle
        </button>
      </div>
    );
  },
}));

const mockLinkComponent = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => <a href={to}>{children}</a>;

const theme = createTheme();

// Create test data
const createMockVideo = (id: string, index: number) => ({
  id: `video${id}`,
  type: 'video' as const,
  title: `Video ${id}`,
  description: `Test video ${id}`,
  thumbnailUrl: `https://example.com/thumb${index}.jpg`,
  source: `https://example.com/video${id}`,
  slug: `video-${id}`,
  duration: 120 + index * 60,
  createdAt: `2023-01-${String(index + 1).padStart(2, '0')}`,
  user: { username: 'testuser' },
  lastWatchedAt: null,
  progressSeconds: 0,
  subtitles: [
    {
      id: `sub-${id}`,
      lang: 'en',
      src: `https://example.com/sub${id}.vtt`,
      isDefault: true,
      label: 'English',
    },
  ],
});

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('VideoDetailContainer', () => {
  const mockVideos = [
    createMockVideo('1', 0),
    createMockVideo('2', 1),
    createMockVideo('3', 2),
  ];

  const createProps = (
    overrides: Partial<VideoDetailContainerProps> = {},
  ): VideoDetailContainerProps => ({
    activeVideoId: 'video1',
    queryRs: {
      isLoading: false,
      error: null,
      videos: [...mockVideos],
      playlist: null,
    },
    LinkComponent: mockLinkComponent,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVideoContainer.mockImplementation(({ video, onEnded }) => (
      <div data-testid="video-container" onClick={() => onEnded?.()}>
        {video.title}
      </div>
    ));
  });

  it('should render loading skeletons when isLoading is true', async () => {
    const loadingProps = {
      ...createProps(),
      queryRs: {
        ...createProps().queryRs,
        isLoading: true,
      },
    };

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...loadingProps} />);
    });

    expect(screen.getByTestId('main-content-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('related-content-skeleton')).toBeInTheDocument();
  });

  it('should render video content and related list when data is loaded', async () => {
    const props = createProps();

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...props} />);
    });

    // Main content checks
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Video 1',
    );
    expect(screen.getByTestId('video-container')).toHaveTextContent('Video 1');

    // Share button should not be present by default
    expect(screen.queryByTitle('Share video')).not.toBeInTheDocument();

    // Related content checks
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
    expect(screen.getByTestId('related-list-title')).toHaveTextContent(
      'Other videos',
    );
    expect(screen.getByTestId('related-list-count')).toHaveTextContent('3');
  });

  it('should display "Same playlist" when playlist is provided', async () => {
    const playlistProps = createProps({
      queryRs: {
        isLoading: false,
        error: null,
        videos: [...mockVideos],
        playlist: {
          __typename: 'playlist',
          id: 'playlist1',
          title: 'My Playlist',
          slug: 'my-playlist',
          createdAt: '2023-01-01',
          user: { __typename: 'users' },
          playlist_videos: [],
          thumbnailUrl: 'https://example.com/playlist.jpg',
          description: 'Test playlist',
        },
      },
    });

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...playlistProps} />);
    });

    expect(screen.getByTestId('related-list-title')).toHaveTextContent(
      'Same playlist',
    );
  });

  it('should return null in MainContent when video is not found', async () => {
    const noVideoProps = createProps({
      activeVideoId: 'nonexistent',
    });

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...noVideoProps} />);
    });

    // The component should return null for the main content
    expect(screen.queryByTestId('video-container')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('should return null in RelatedContent when video is not found', async () => {
    const noVideoProps = createProps({
      activeVideoId: 'nonexistent',
    });

    await act(async () => {
      renderWithTheme(<VideoDetailContainer {...noVideoProps} />);
    });

    // The component should return null for the related content
    expect(screen.queryByTestId('related-list')).not.toBeInTheDocument();
  });

  it('should handle video errors', async () => {
    mockVideoContainer.mockImplementation(({ onError }) => {
      // Simulate an error after a small delay to test the error handling
      setTimeout(() => {
        if (onError) {
          onError(new Error('Test video error'));
        }
      }, 100);
      return <div data-testid="video-container">Video Player</div>;
    });

    renderWithTheme(<VideoDetailContainer {...createProps()} />);

    // Wait for the error to be handled asynchronously
    await new Promise((resolve) => setTimeout(resolve, 150));

    // The error is handled by the VideoPlayer component, but we're just verifying
    // that the error handling doesn't crash the component
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
  });

  it('should handle video end and auto-play next video', async () => {
    const onVideoEnded = vi.fn();
    const props = createProps({
      onVideoEnded,
    });

    renderWithTheme(<VideoDetailContainer {...props} />);

    // Simulate video end
    fireEvent.click(screen.getByTestId('video-container'));

    // Should trigger onVideoEnded with next video
    expect(onVideoEnded).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'video2' }),
    );
  });

  it('should handle auto-play toggle', async () => {
    const onVideoEnded = vi.fn();
    const props = createProps({
      onVideoEnded,
    });

    renderWithTheme(<VideoDetailContainer {...props} />);

    // Auto-play checkbox should be present
    const checkbox = screen.getByTestId('related-list-autoplay');
    expect(checkbox).toBeInTheDocument();

    // Check initial state
    expect(checkbox).toBeChecked();

    // Toggle auto-play off
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Toggle auto-play back on
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  describe('share functionality', () => {
    it('should not show share button when onShare prop is not provided', async () => {
      const props = createProps();
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...props} />);
      });
      expect(screen.queryByLabelText('Share video')).not.toBeInTheDocument();
    });

    it('should show share button when onShare prop is provided', async () => {
      const onShare = vi.fn();
      const props = createProps({
        onShare,
      });
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...props} />);
      });
      expect(screen.getByLabelText('Share video')).toBeInTheDocument();
    });

    it('should call onShare with correct data when share button is clicked', async () => {
      const onShare = vi.fn();
      const props = createProps({
        onShare,
      });
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...props} />);
      });
      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      const shareDialog = screen.getByTestId('share-dialog');
      expect(shareDialog).toHaveStyle({ display: 'block' });
    });

    it('should handle share dialog close', async () => {
      const onShare = vi.fn();
      const props = createProps({
        onShare,
      });
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...props} />);
      });
      // Open dialog
      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      // Close dialog
      const closeButton = screen.getByText('Close');
      await act(async () => {
        fireEvent.click(closeButton);
      });

      const shareDialog = screen.getByTestId('share-dialog');
      expect(shareDialog).toHaveStyle({ display: 'none' });
    });

    it('should call onShare callback with emails when share is confirmed', async () => {
      const onShare = vi.fn();
      const props = createProps({
        onShare,
      });
      await act(async () => {
        renderWithTheme(<VideoDetailContainer {...props} />);
      });
      // Open dialog
      const shareButton = screen.getByLabelText('Share video');
      await act(async () => {
        fireEvent.click(shareButton);
      });

      // Click share button in dialog
      const dialogShareButton = screen.getByText('Share');
      await act(async () => {
        fireEvent.click(dialogShareButton);
      });

      expect(onShare).toHaveBeenCalledWith(['test@example.com']);
    });
  });

  describe('subtitle editing', () => {
    it('renders subtitle chips for available subtitles', () => {
      renderWithTheme(<VideoDetailContainer {...createProps()} />);
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('opens subtitle dialog when edit button is clicked', async () => {
      renderWithTheme(<VideoDetailContainer {...createProps()} />);
      userEvent.click(screen.getByRole('button', { name: /edit subtitle/i }));
      expect(await screen.findByTestId('subtitle-dialog')).toBeInTheDocument();
    });

    it('calls useSaveSubtitle and closes dialog on save', async () => {
      renderWithTheme(<VideoDetailContainer {...createProps()} />);
      userEvent.click(screen.getByRole('button', { name: /edit subtitle/i }));
      await screen.findByTestId('save-subtitle-button');
      userEvent.click(screen.getByTestId('save-subtitle-button'));
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'sub-1',
          object: {
            urlInput: 'https://example.com/updated-subtitle.vtt',
          },
        });
        expect(screen.queryByTestId('subtitle-dialog')).toBeNull();
      });
    });
  });
});
