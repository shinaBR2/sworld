import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import type { Auth } from 'core';
import { ResponsiveAvatar } from 'ui/universal';
import Logo from 'ui/universal/logo';
import SiteChoices from 'ui/universal/site-choices';
// TODO fix this
import type { WithLinkComponent } from 'ui/watch/videos/types';

interface HeaderProps extends WithLinkComponent {
  sites: {
    listen: string;
    watch: string;
    play: string;
    til: string;
  };
  user: Auth.CustomUser | null;
  login: () => void;
  toggleSidebar: () => void;
}

const Header = (props: HeaderProps) => {
  const { sites, LinkComponent, user, login, toggleSidebar } = props;
  const avatarUrl = user?.picture;

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
    >
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
          <SiteChoices activeSite="til" sites={sites} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            minWidth: 'fit-content',
            gap: 1,
            alignItems: 'center',
          }}
        >
          {user && LinkComponent && (
            <LinkComponent to="/write">
              <Button
                color="inherit"
                sx={{ mr: 1, textTransform: 'none', fontWeight: 500 }}
              >
                Write
              </Button>
            </LinkComponent>
          )}

          <IconButton onClick={!user ? login : toggleSidebar}>
            {avatarUrl ? (
              <ResponsiveAvatar
                src={avatarUrl}
                alt={user!.name}
                data-testid="user-avatar"
                sx={{ width: 32, height: 32 }}
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
