import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Auth } from 'core';
import { ResponsiveAvatar } from '../../universal';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
import { RequiredLinkComponent } from '../videos/interface';

interface HeaderProps extends RequiredLinkComponent {
  toggleSetting: React.Dispatch<React.SetStateAction<boolean>>;
  sites: {
    listen: string;
    watch: string;
    play: string;
  };
  user: Auth.CustomUser | null;
}

const Header = (props: HeaderProps) => {
  const { toggleSetting, sites, user, LinkComponent } = props;
  const avatarUrl = user?.picture;

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
          {/* <IconButton>
            <Menu open={false} />
          </IconButton> */}
          <Logo LinkComponent={LinkComponent} />
          <SiteChoices activeSite="watch" sites={sites} />
        </Box>

        {/* <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <SearchBar />
        </Box> */}

        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
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
