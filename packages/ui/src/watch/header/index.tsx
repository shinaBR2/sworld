import { AccountCircle } from '@mui/icons-material';
import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import { Auth } from 'core';
import { ResponsiveAvatar } from '../../universal';
import Logo from '../../universal/logo';
import SearchBar from '../../universal/search-bar';
import SiteChoices from '../../universal/site-choices';

interface HeaderProps {
  toggleSetting: React.Dispatch<React.SetStateAction<boolean>>;
  sites: {
    listen: string;
    watch: string;
    play: string;
  };
  user: Auth.CustomUser | null;
}

const Header = (props: HeaderProps) => {
  const { toggleSetting, sites, user } = props;
  const avatarUrl = user?.picture;

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 'fit-content',
          }}
        >
          {/* <IconButton>
            <Menu open={false} />
          </IconButton> */}
          <Logo />
          <SiteChoices activeSite="watch" sites={sites} />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <SearchBar />
        </Box>

        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
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
