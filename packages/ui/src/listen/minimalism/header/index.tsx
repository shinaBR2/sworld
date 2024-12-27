import { AccountCircle } from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Logo from '../../../universal/logo';
import SiteChoices from '../../../universal/site-choices';

interface HeaderProps {
  toggleSetting: React.Dispatch<React.SetStateAction<boolean>>;
  sites: {
    listen: string;
    watch: string;
    play: string;
  };
}

const Header = (props: HeaderProps) => {
  const { toggleSetting, sites } = props;

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
          <IconButton onClick={() => toggleSetting(true)}>
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
