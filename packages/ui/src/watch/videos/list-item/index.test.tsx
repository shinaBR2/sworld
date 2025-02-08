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

    // Check duration
    const durationElement = screen.getByText('3:45');
    expect(durationElement).toBeInTheDocument();
  });

  it('passes correct link navigation props', () => {
    render(<VideoListItem video={mockVideo} LinkComponent={mockLinkComponent} />);

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

    // Check default (inactive) state
    // const defaultLink = screen.getByTestId('link-component');
    // const link = screen.getByRole('link', { current: true });
    // console.log(link);
    // expect(link).not.toHaveAttribute('aria-current');
    // expect(defaultLink).not.toHaveAttribute('aria-current');

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
});
