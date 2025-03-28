import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent } from '../videos/types';
import { useQueryContext } from 'core/providers/query';
import { NotificationItem } from './notification-item';
import { useMarkNotificationAsRead } from 'core/universal/hooks/useMarkNotificationAsRead';
import { useAuthContext } from 'core/providers/auth';
import { useCallback } from 'react';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationsMenu = ({ anchorEl, onClose, LinkComponent }: NotificationsMenuProps) => {
  const { notifications } = useQueryContext();
  const { getAccessToken } = useAuthContext();
  const { markAsRead } = useMarkNotificationAsRead({
    getAccessToken,
    onSuccess: data => {
      // onClose(); // Close popup after successful mutation
      // onSuccess?.(data);
    },
    // onError,
  });

  const onClick = useCallback(
    (notificationId: string) => () => {
      markAsRead({ notificationId });
    },
    []
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 320, maxHeight: 400 },
        },
      }}
    >
      {notifications.data?.length ? (
        notifications.data.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onClick(notification.id)}
            LinkComponent={LinkComponent}
          />
        ))
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </MenuItem>
      )}
    </Menu>
  );
};

export { NotificationsMenu };
