import { useState } from 'react';
import { useAuthContext } from 'core/providers/auth';
import { NotificationsMenu } from './notifications-menu';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { RequiredLinkComponentWithoutLinkProps } from '../videos/types';
import { useQueryContext } from 'core/providers/query';

const Notifications = ({ LinkComponent }: RequiredLinkComponentWithoutLinkProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isSignedIn } = useAuthContext();
  const { notifications } = useQueryContext();
  const unreadCount = notifications.data?.filter(n => !n.readAt).length || 0;

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!isSignedIn) return null;

  return (
    <>
      <IconButton
        onClick={handleNotificationClick}
        disabled={notifications.isLoading}
        aria-expanded={Boolean(anchorEl)}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      {anchorEl && <NotificationsMenu anchorEl={anchorEl} onClose={handleClose} LinkComponent={LinkComponent} />}
    </>
  );
};

export default Notifications;
