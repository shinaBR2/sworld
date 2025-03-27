import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent } from '../videos/types';
import { useQueryContext } from 'core/providers/query';
import { NotificationItem } from './notification-item';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationsMenu = ({ anchorEl, onClose, LinkComponent }: NotificationsMenuProps) => {
  const { notifications } = useQueryContext();

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
            onClose={onClose}
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
