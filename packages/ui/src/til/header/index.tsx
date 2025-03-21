import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Auth } from 'core';
import { ResponsiveAvatar } from '../../universal';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
// TODO fix this
import { RequiredLinkComponent } from '../../watch/videos/types';

interface HeaderProps extends RequiredLinkComponent {
  sites: {
    listen: string;
    watch: string;
    play: string;
    til: string;
  };
}

const Header = (props: HeaderProps) => {
  const { sites, LinkComponent } = props;

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
      </Toolbar>
    </AppBar>
  );
};

export { Header };
