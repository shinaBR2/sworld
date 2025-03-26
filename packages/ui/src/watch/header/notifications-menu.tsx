import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { RequiredLinkComponent } from '../videos/types';
import { useQueryContext } from 'core/providers/query';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationsMenu = ({ anchorEl, onClose }: NotificationsMenuProps) => {
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
          <MenuItem
            key={notification.id}
            onClick={onClose}
            sx={{
              whiteSpace: 'normal',
              bgcolor: notification.readAt ? 'inherit' : 'action.hover',
            }}
          >
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: notification.readAt ? 'normal' : 'bold' }}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
            </Box>
          </MenuItem>
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
