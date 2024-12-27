import { AccountCircle } from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Logo from '../../../universal/logo';
import SiteChoices from '../../../universal/site-choices';

const Header = (props: { toggleSetting: any }) => {
  const { toggleSetting } = props;

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
          <SiteChoices />
        </Box>

        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          <IconButton onClick={() => toggleSetting(true)}>
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
