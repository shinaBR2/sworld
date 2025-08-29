import { Link } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NotificationItem } from './notification-item';
import { NOTIFICATION_TEXTS } from './texts';
import { NOTIFICATION_TYPES } from './types';

describe('NotificationItem', () => {
  const mockNotification = {
    id: 1,
    type: NOTIFICATION_TYPES.VIDEO_READY,
    readAt: null,
    title: 'Original Title',
    message: 'Original Message',
    entityId: 'id-123',
    entityType: 'Video',
  };

  // Update defaultProps to match component props
  const defaultProps = {
    notification: mockNotification,
    onClick: vi.fn(), // Changed from onClose to onClick
    LinkComponent: Link,
  };

  // Update test case for click handler
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationItem {...defaultProps} />);

    await user.click(screen.getByRole('menuitem'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1); // Changed from onClose to onClick
  });

  // Remove onClose references from read/unread tests
  describe('read/unread states', () => {
    it('shows unread state for notification without readAt', () => {
      render(<NotificationItem {...defaultProps} />);
      const title = screen.getByText((content) =>
        content.includes(
          NOTIFICATION_TEXTS[NOTIFICATION_TYPES.VIDEO_READY].title,
        ),
      );
      expect(title).toHaveStyle({ fontWeight: 'bold' });
    });

    it('shows read state for notification with readAt', () => {
      const readProps = {
        ...defaultProps,
        notification: {
          ...mockNotification,
          readAt: '2024-01-01T00:00:00Z',
        },
      };

      render(<NotificationItem {...readProps} />);

      const title = screen.getByText((content) =>
        content.includes(
          NOTIFICATION_TEXTS[NOTIFICATION_TYPES.VIDEO_READY].title,
        ),
      );
      expect(title).toHaveStyle({ fontWeight: 'normal' });
    });
  });

  describe('notification icons', () => {
    it('shows correct icon for video ready notification', () => {
      const { container } = render(<NotificationItem {...defaultProps} />);
      expect(container.textContent).toContain('🎥');
    });

    it('shows default icon for unknown notification type', () => {
      const unknownTypeProps = {
        ...defaultProps,
        notification: {
          ...mockNotification,
          type: 'unknown-type' as any,
        },
      };

      const { container } = render(<NotificationItem {...unknownTypeProps} />);
      expect(container.textContent).toContain('📢');
    });
  });
});
