import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from './index';
import '@testing-library/jest-dom';
import { Link } from '@mui/material';
import { useQueryContext } from 'core/providers/query';
import { useAuthContext } from 'core/providers/auth';

// Mock the child components
vi.mock('../../universal/logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('../../universal/site-choices', () => ({
  default: () => <div data-testid="mock-site-choices">SiteChoices</div>,
}));

vi.mock('./notifications-menu', () => ({
  NotificationsMenu: ({ anchorEl, onClose }: any) => (
    <div data-testid="mock-notifications-menu" data-open={Boolean(anchorEl)} onClick={onClose}>
      NotificationsMenu
    </div>
  ),
}));

// Mock Query context
const mockNotifications = {
  data: [
    { id: 1, readAt: null },
    { id: 2, readAt: new Date().toISOString() },
  ],
  isLoading: false,
};

// Update the mock at the top of the file
vi.mock('core/providers/query', () => ({
  useQueryContext: vi.fn(() => ({
    notifications: mockNotifications,
    hasuraUrl: 'hasura-url',
    featureFlags: {
      data: null,
      isLoading: false,
      error: null,
    },
  })),
}));

// Add auth mock at the top
vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn().mockReturnValue({
    isSignedIn: false,
    getAccessToken: vi.fn(),
  }),
}));

describe('Header', () => {
  const defaultProps = {
    toggleSetting: vi.fn(),
    sites: {
      listen: 'listen',
      watch: 'watch',
      play: 'play',
      til: 'til',
    },
    user: null,
    LinkComponent: Link,
    linkProps: {
      to: '/',
    },
  };

  it('renders all components correctly', () => {
    render(<Header {...defaultProps} />);

    // Check if all components are rendered
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-site-choices')).toBeInTheDocument();

    // Check if account button is rendered
    const accountButton = screen.getByTestId('AccountCircleIcon').closest('button');
    expect(accountButton).toBeInTheDocument();
  });

  it('renders account circle button for anonymous visitors', () => {
    render(<Header {...defaultProps} />);

    const accountButton = screen.getByTestId('AccountCircleIcon').closest('button');
    expect(accountButton).toBeInTheDocument();
  });

  it('should not show notifications when signed out', () => {
    render(<Header {...defaultProps} />);
    expect(screen.queryByTestId('NotificationsIcon')).not.toBeInTheDocument();
  });

  it('should show account circle when signed out', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
  });

  // Modify existing avatar test
  it('renders avatar for signed in user', () => {
    vi.mocked(useAuthContext).mockReturnValue({ isSignedIn: true });
    const props = {
      ...defaultProps,
      user: {
        id: '123',
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg',
      },
    };
    const { container } = render(<Header {...props} />);

    const avatar = within(container).getByTestId('user-avatar');
    const avatarImg = within(avatar).getByRole('img');
    expect(avatarImg).toHaveAttribute('src', props.user.picture);
    expect(avatarImg).toHaveAttribute('alt', props.user.name);
  });

  // Update notification tests to use auth mock
  it('renders notification button when signed in', () => {
    vi.mocked(useAuthContext).mockReturnValue({ isSignedIn: true });
    render(<Header {...defaultProps} />);
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  it('shows correct unread count when signed in', () => {
    vi.mocked(useAuthContext).mockReturnValue({ isSignedIn: true });
    render(<Header {...defaultProps} />);
    const badge = screen.getByTestId('NotificationsIcon').closest('button')?.querySelector('.MuiBadge-badge');
    expect(badge).toHaveTextContent('1');
  });

  it('calls toggleSetting when account button is clicked', () => {
    render(<Header {...defaultProps} />);

    // Find and click the account button
    const accountButton = screen.getByTestId('AccountCircleIcon').closest('button');
    fireEvent.click(accountButton as Element);

    // Check if toggleSetting was called with true
    expect(defaultProps.toggleSetting).toHaveBeenCalledWith(true);
  });

  it('maintains correct layout structure', () => {
    render(<Header {...defaultProps} />);

    // Check if AppBar is rendered with correct position
    const appBar = screen.getByRole('banner');

    expect(appBar).toHaveClass('MuiAppBar-positionSticky');

    // Check if Toolbar is rendered
    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();

    // Check if the three main sections are rendered with correct layout
    const boxes = document.querySelectorAll('.MuiBox-root');
    expect(boxes).toHaveLength(2);
  });

  it('renders without elevation', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ boxShadow: 'none' });
  });

  it('uses default color', () => {
    render(<Header {...defaultProps} />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-colorDefault');
  });

  it('renders notification button with correct unread count', () => {
    render(<Header {...defaultProps} />);

    const badge = screen.getByTestId('NotificationsIcon').closest('button')?.querySelector('.MuiBadge-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('1');
  });

  it('opens notification menu when notification button is clicked', () => {
    render(<Header {...defaultProps} />);

    const notificationButton = screen.getByTestId('NotificationsIcon').closest('button');
    fireEvent.click(notificationButton as Element);

    const menu = screen.getByTestId('mock-notifications-menu');
    expect(menu).toHaveAttribute('data-open', 'true');
  });

  it('closes notification menu when clicking away', () => {
    render(<Header {...defaultProps} />);

    const notificationButton = screen.getByTestId('NotificationsIcon').closest('button');
    fireEvent.click(notificationButton as Element);

    const menu = screen.getByTestId('mock-notifications-menu');
    expect(menu).toHaveAttribute('data-open', 'true');

    // Simulate menu close by clicking the menu itself
    fireEvent.click(menu);

    expect(menu).toHaveAttribute('data-open', 'false');
  });

  it('disables notification button while loading', () => {
    // Mock loading state
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [],
        isLoading: true,
        error: null,
      },
      hasuraUrl: 'hasura-url',
      featureFlags: {
        data: null,
        isLoading: false,
        error: null,
      },
    }));

    render(<Header {...defaultProps} />);

    const notificationButton = screen.getByTestId('NotificationsIcon').closest('button');
    expect(notificationButton).toBeDisabled();
  });

  it('enables notification button when loading completes', () => {
    // Mock loaded state
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [],
        isLoading: false,
        error: null,
      },
      hasuraUrl: 'hasura-url',
      featureFlags: {
        data: null,
        isLoading: false,
        error: null,
      },
    }));

    render(<Header {...defaultProps} />);

    const notificationButton = screen.getByTestId('NotificationsIcon').closest('button');
    expect(notificationButton).not.toBeDisabled();
  });
});
