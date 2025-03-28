import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import { Auth, Query } from 'core';
import { ResponsiveAvatar } from '../../universal';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
import { RequiredLinkComponent } from '../videos/types';
import { useState } from 'react';
import { NotificationsMenu } from './notifications-menu';
import { useAuthContext } from 'core/providers/auth';

interface HeaderProps extends RequiredLinkComponent {
  toggleSetting: React.Dispatch<React.SetStateAction<boolean>>;
  sites: {
    listen: string;
    watch: string;
    play: string;
    til: string;
  };
  user: Auth.CustomUser | null;
}

const Header = (props: HeaderProps) => {
  const { toggleSetting, sites, user, LinkComponent } = props;
  const avatarUrl = user?.picture;
  const { notifications } = Query.useQueryContext();
  const { isSignedIn } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.data?.filter(n => !n.readAt).length || 0;

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 'fit-content',
          }}
        >
          <Logo LinkComponent={LinkComponent} />
          <SiteChoices activeSite="watch" sites={sites} />
        </Box>

        <Box sx={{ display: 'flex', minWidth: 'fit-content', gap: 1, alignItems: 'center' }}>
          {isSignedIn && (
            <>
              <IconButton onClick={handleNotificationClick} disabled={notifications.isLoading}>
                <Badge badgeContent={unreadCount} color="primary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <NotificationsMenu anchorEl={anchorEl} onClose={handleClose} LinkComponent={LinkComponent} />
            </>
          )}
          <IconButton onClick={() => toggleSetting(true)}>
            {avatarUrl ? (
              <ResponsiveAvatar src={avatarUrl} alt={user.name} data-testid="user-avatar" />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
