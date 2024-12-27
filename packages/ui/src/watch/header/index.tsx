import { AccountCircle } from '@mui/icons-material';
import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
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
}

const Header = (props: HeaderProps) => {
  const { toggleSetting, sites } = props;

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
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
