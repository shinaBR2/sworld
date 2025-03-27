import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NotificationsMenu } from './notifications-menu';
import '@testing-library/jest-dom';
import { Link } from '@mui/material';
import { useQueryContext } from 'core/providers/query';

type NotificationType = {
  id: number;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  link?: string;
};

// Mock NotificationItem component
vi.mock('./notification-item', () => ({
  NotificationItem: ({ notification }: { notification: NotificationType }) => (
    <div data-testid="mock-notification-item" data-notification-id={notification.id}>
      Notification Item
    </div>
  ),
}));

// Mock useQueryContext hook
vi.mock('core/providers/query', () => ({
  useQueryContext: vi.fn(() => ({
    notifications: {
      data: [],
      isLoading: false,
    },
  })),
}));

describe('NotificationsMenu', () => {
  const defaultProps = {
    anchorEl: document.createElement('div'),
    onClose: vi.fn(),
    LinkComponent: Link,
  };

  it('renders empty state when there are no notifications', () => {
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [] as NotificationType[],
        isLoading: false,
      },
    }));

    render(<NotificationsMenu {...defaultProps} />);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notification items when there are notifications', () => {
    const mockNotifications: NotificationType[] = [
      { id: 1, type: 'default', title: 'Test 1', message: 'Message 1', readAt: null },
      { id: 2, type: 'default', title: 'Test 2', message: 'Message 2', readAt: null },
    ];

    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: mockNotifications,
        isLoading: false,
      },
    }));

    render(<NotificationsMenu {...defaultProps} />);

    const items = screen.getAllByTestId('mock-notification-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-notification-id', '1');
    expect(items[1]).toHaveAttribute('data-notification-id', '2');
  });

  it('does not render menu when anchorEl is null', () => {
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [],
        isLoading: false,
      },
    }));

    render(<NotificationsMenu {...defaultProps} anchorEl={null} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders menu when anchorEl is provided', () => {
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [],
        isLoading: false,
      },
    }));

    render(<NotificationsMenu {...defaultProps} />);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('calls onClose when menu is closed', () => {
    vi.mocked(useQueryContext).mockImplementation(() => ({
      notifications: {
        data: [],
        isLoading: false,
      },
    }));

    render(<NotificationsMenu {...defaultProps} />);

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
