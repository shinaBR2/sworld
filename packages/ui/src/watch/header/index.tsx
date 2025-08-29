import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import type { Auth } from 'core';
// Add at top with other imports
import { lazy, Suspense } from 'react';
import { ResponsiveAvatar } from '../../universal';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
import type { RequiredLinkComponent } from '../videos/types';

const Notifications = lazy(() => import('./notifications'));

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

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar
        sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}
      >
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

        <Box
          sx={{
            display: 'flex',
            minWidth: 'fit-content',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Suspense fallback={null}>
            <Notifications LinkComponent={LinkComponent} />
          </Suspense>
          <IconButton onClick={() => toggleSetting(true)}>
            {avatarUrl ? (
              <ResponsiveAvatar
                src={avatarUrl}
                alt={user.name}
                data-testid="user-avatar"
              />
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
