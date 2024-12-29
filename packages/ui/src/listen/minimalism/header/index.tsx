import { AccountCircle } from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { Auth } from 'core';
import { ResponsiveAvatar } from '../../../universal';
import Logo from '../../../universal/logo';
import SiteChoices from '../../../universal/site-choices';

interface HeaderProps {
  onProfileClick: () => void;
  sites: {
    listen: string;
    watch: string;
    play: string;
  };
  user: Auth.CustomUser | null;
}

const Header = (props: HeaderProps) => {
  const { onProfileClick, sites, user } = props;
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
          <Logo />
          <SiteChoices sites={sites} activeSite="listen" />
        </Box>

        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          <IconButton onClick={onProfileClick}>
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
