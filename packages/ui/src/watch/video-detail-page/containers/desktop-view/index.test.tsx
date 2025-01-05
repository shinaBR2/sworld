import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopView } from './index';

// Mocks must be defined before any imports
vi.mock('../../../videos/video-player', () => ({
  VideoPlayer: () => <div data-testid="video-player">Video Player</div>,
}));

vi.mock('../../related-list', () => ({
  RelatedList: () => <div data-testid="related-list">Related List</div>,
}));

// Mock data
const mockVideo = {
  id: '1',
  title: 'Test Video',
  thumbnail: 'test.jpg',
  duration: '3:45',
  user: {
    username: 'testuser',
  },
};

const mockLinkComponent = ({
  children,
}: {
  to: string;
  params: Record<string, string>;
  children: React.ReactNode;
}) => <div data-testid="link-component">{children}</div>;

describe('DesktopView', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render skeleton when loading', () => {
    const { container } = render(
      <DesktopView
        queryRs={{
          videos: [],
          isLoading: true,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    // Check if skeletons are rendered
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);

    // Video player should not be rendered
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    expect(screen.queryByTestId('related-list')).not.toBeInTheDocument();
  });

  it('should render content when not loading', () => {
    render(
      <DesktopView
        queryRs={{
          videos: [mockVideo],
          isLoading: false,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    // Check if main components are rendered
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByTestId('related-list')).toBeInTheDocument();
  });

  it('should maintain correct grid layout', () => {
    const { container } = render(
      <DesktopView
        queryRs={{
          videos: [mockVideo],
          isLoading: false,
        }}
        LinkComponent={mockLinkComponent}
      />
    );

    // Check grid containers
    const gridContainers = container.querySelectorAll('.MuiGrid-container');
    expect(gridContainers.length).toBeGreaterThan(0);

    // Check spacing
    const mainGrid = container.querySelector(
      '.MuiGrid-container'
    ) as HTMLElement;
    expect(mainGrid).toBeInTheDocument();
  });
});
