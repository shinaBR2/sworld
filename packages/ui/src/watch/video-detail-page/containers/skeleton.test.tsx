import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the VideoListItemSkeleton component
vi.mock('../../videos/list-item/skeleton', () => ({
  VideoListItemSkeleton: () => <div data-testid="video-list-item-skeleton" />,
}));

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('MainContentSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    renderWithTheme(<MainContentSkeleton />);

    // Check for video player skeleton with aria attributes
    const videoPlayerSkeleton = screen.getByLabelText('Loading video player');
    expect(videoPlayerSkeleton).toBeInTheDocument();
    expect(videoPlayerSkeleton).toHaveAttribute('aria-busy', 'true');

    // Verify rounded skeleton inside
    const titleSkeleton = screen.getByLabelText('Loading video title');
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('should have correct aspect ratio for video player', () => {
    renderWithTheme(<MainContentSkeleton />);

    const videoPlayerSkeleton = screen.getByLabelText('Loading video player');
    expect(videoPlayerSkeleton).toHaveStyle('aspect-ratio: 16/9');
  });
});

describe('RelatedContentSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    renderWithTheme(<RelatedContentSkeleton />);

    // Check for heading skeleton with aria attributes
    const headingSkeleton = screen.getByLabelText('Loading related videos');
    expect(headingSkeleton).toBeInTheDocument();
    expect(headingSkeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('should render correct number of video item skeletons', () => {
    renderWithTheme(<RelatedContentSkeleton />);

    // Verify 6 video list item skeletons are rendered
    const videoItemSkeletons = screen.getAllByTestId('video-list-item-skeleton');
    expect(videoItemSkeletons).toHaveLength(6);
  });
});
