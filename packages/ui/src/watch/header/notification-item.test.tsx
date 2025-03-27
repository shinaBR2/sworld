import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from './notification-item';
import { NOTIFICATION_TYPES } from './types';
import { NOTIFICATION_TEXTS } from './texts';
import { Link } from '@mui/material';

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

  const defaultProps = {
    notification: mockNotification,
    onClose: vi.fn(),
    LinkComponent: Link,
  };

  it('renders video ready notification with correct texts', () => {
    render(<NotificationItem {...defaultProps} />);

    const texts = NOTIFICATION_TEXTS[NOTIFICATION_TYPES.VIDEO_READY];
    expect(screen.getByText(content => content.includes(texts.title))).toBeInTheDocument();
    expect(screen.getByText(texts.message)).toBeInTheDocument();
  });

  it('renders default notification for unknown type', () => {
    const unknownTypeProps = {
      ...defaultProps,
      notification: {
        ...mockNotification,
        type: 'unknown-type' as any,
      },
    };

    render(<NotificationItem {...unknownTypeProps} />);

    const defaultTexts = NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT];
    expect(screen.getByText(content => content.includes(defaultTexts.title))).toBeInTheDocument();
    expect(screen.getByText(defaultTexts.message)).toBeInTheDocument();
  });

  it('calls onClose when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationItem {...defaultProps} />);

    await user.click(screen.getByRole('menuitem'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  describe('read/unread states', () => {
    it('shows unread state for notification without readAt', () => {
      render(<NotificationItem {...defaultProps} />);

      const texts = NOTIFICATION_TEXTS[NOTIFICATION_TYPES.VIDEO_READY];
      const title = screen.getByText(content => content.includes(texts.title));
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

      const texts = NOTIFICATION_TEXTS[NOTIFICATION_TYPES.VIDEO_READY];
      const title = screen.getByText(content => content.includes(texts.title));
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
