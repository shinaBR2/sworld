import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Notifications from './notifications';
import { useAuthContext } from 'core/providers/auth';
import { useQueryContext } from 'core/providers/query';
import { NotificationsMenu } from './notifications-menu';

// Update auth mock to provide full context structure
vi.mock('core/providers/auth', () => ({
  useAuthContext: vi.fn(() => ({
    isSignedIn: false,
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

// Update query context mock to match actual structure
vi.mock('core/providers/query', () => ({
  useQueryContext: vi.fn(() => ({
    notifications: {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    },
    // Add other query context properties if needed
  })),
}));

// Update beforeEach to reset mocks properly
beforeEach(() => {
  vi.mocked(useAuthContext).mockImplementation(() => ({
    isSignedIn: false,
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }));

  vi.mocked(useQueryContext).mockImplementation(() => ({
    notifications: {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    },
    // Add empty mocks for other query context properties
    videos: { data: [], isLoading: false },
    posts: { data: [], isLoading: false },
  }));
});

vi.mock('./notifications-menu', () => ({
  NotificationsMenu: vi.fn(() => <div data-testid="mock-notifications-menu" />),
}));

describe('Notifications', () => {
  const LinkComponent = () => <div>Mock Link</div>;
  const mockNotifications = [
    { id: '1', type: 'default', title: 'Test 1', message: 'Message 1', readAt: null },
    { id: '2', type: 'default', title: 'Test 2', message: 'Message 2', readAt: '2023-01-01' },
  ];

  // Update failing test cases
  it('does not render when user is not signed in', () => {
    vi.mocked(useAuthContext).mockImplementation(() => ({
      isSignedIn: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    }));

    render(<Notifications LinkComponent={LinkComponent} />);
    expect(screen.queryByTestId('NotificationsIcon')).not.toBeInTheDocument();
  });

  it('opens menu when clicked', () => {
    vi.mocked(useAuthContext).mockImplementation(() => ({
      isSignedIn: true,
      user: { id: '123', name: 'Test User' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    }));

    render(<Notifications LinkComponent={LinkComponent} />);
    fireEvent.click(screen.getByTestId('NotificationsIcon').closest('button')!);
    expect(NotificationsMenu).toHaveBeenCalled();
  });

  it('closes menu when handleClose is called', async () => {
    // Setup auth mock
    vi.mocked(useAuthContext).mockImplementation(() => ({
      isSignedIn: true,
      user: { id: '123', name: 'Test User' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    }));

    // Track when onClose is called
    let onCloseHandler: (() => void) | null = null;

    // Override the NotificationsMenu mock to capture the onClose handler
    vi.mocked(NotificationsMenu).mockImplementation(props => {
      onCloseHandler = props.onClose;
      return <div data-testid="mock-notifications-menu" />;
    });

    // Render the component
    const { rerender } = render(<Notifications LinkComponent={LinkComponent} />);

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify menu opened
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('mock-notifications-menu')).toBeInTheDocument();

    // Make sure we captured the handler
    expect(onCloseHandler).not.toBeNull();

    // Call the onClose handler directly
    await act(async () => {
      onCloseHandler!();
    });

    // Force a rerender to ensure state updates are applied
    rerender(<Notifications LinkComponent={LinkComponent} />);

    // Now check that the menu is closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('mock-notifications-menu')).not.toBeInTheDocument();
  });

  // Update test cases to use full mock structure
  it('renders notification icon when signed in', () => {
    vi.mocked(useAuthContext).mockImplementation(() => ({
      isSignedIn: true,
      user: { id: '123', name: 'Test User' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    }));

    render(<Notifications LinkComponent={LinkComponent} />);
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  // Update query context mock in "shows correct unread count"
  it('shows correct unread count', () => {
    vi.mocked(useAuthContext).mockImplementation(() => ({
      isSignedIn: true,
      user: { id: '123', name: 'Test User' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    }));

    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: mockNotifications,
        isLoading: false,
        refetch: vi.fn(),
      },
      videos: { data: [], isLoading: false },
      posts: { data: [], isLoading: false },
    }));

    render(<Notifications LinkComponent={LinkComponent} />);
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    vi.mocked(useAuthContext).mockReturnValue({ isSignedIn: true });
    vi.mocked(useQueryContext).mockReturnValue({
      notifications: {
        data: [],
        isLoading: true,
      },
    });

    render(<Notifications LinkComponent={LinkComponent} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
