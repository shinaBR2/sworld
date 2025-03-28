import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent } from '../videos/types';
import { useQueryContext } from 'core/providers/query';
import { NotificationItem } from './notification-item';
import { useMarkNotificationAsRead } from 'core/universal/hooks/useMarkNotificationAsRead';
import { useAuthContext } from 'core/providers/auth';
import { useCallback } from 'react';
import Divider from '@mui/material/Divider';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationsMenu = ({ anchorEl, onClose, LinkComponent }: NotificationsMenuProps) => {
  const { notifications } = useQueryContext();
  const { getAccessToken } = useAuthContext();
  const { markAsRead, markAllAsRead } = useMarkNotificationAsRead({
    getAccessToken,
    onSuccess: () => {
      // onClose(); // Close popup after successful mutation
      // onSuccess?.(data);
    },
    // onError,
  });

  const onItemClick = useCallback(
    (notificationId: string) => () => {
      markAsRead({ notificationId });
    },
    [markAsRead]
  );

  const handleMarkAll = useCallback(() => {
    const ids = notifications.data?.map(notification => notification.id) || [];
    markAllAsRead({ ids });
  }, [notifications.data, markAllAsRead]);

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
            onClick={onItemClick(notification.id)}
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

      {(notifications.data?.length ?? 0) > 0 && (
        <>
          <Divider />
          <MenuItem onClick={handleMarkAll}>
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                width: '100%',
                color: 'primary.main',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              Mark All as Read
            </Typography>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export { NotificationsMenu };
