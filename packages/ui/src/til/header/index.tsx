import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import type { Auth } from 'core';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
// TODO fix this
import type { WithLinkComponent } from '../../watch/videos/types';

interface HeaderProps extends WithLinkComponent {
  sites: {
    listen: string;
    watch: string;
    play: string;
    til: string;
  };
  user: Auth.CustomUser | null;
  login: () => void;
  logout: () => void;
}

const Header = (props: HeaderProps) => {
  const { sites, LinkComponent, user, login, logout } = props;

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
          <SiteChoices activeSite="til" sites={sites} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && LinkComponent && (
            <LinkComponent to="/write">
              <Button color="inherit" sx={{ mr: 1 }}>
                Write
              </Button>
            </LinkComponent>
          )}
          {!user ? (
            <Button color="inherit" onClick={login}>
              Login
            </Button>
          ) : (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
