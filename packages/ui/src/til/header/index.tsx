import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Logo from '../../universal/logo';
import SiteChoices from '../../universal/site-choices';
import type { WithLinkComponent } from '../../watch/videos/types';

interface HeaderProps extends WithLinkComponent {
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
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            minHeight: { xs: 56, sm: 64 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 'fit-content',
              gap: 2,
            }}
          >
            <Logo LinkComponent={LinkComponent} />
            <SiteChoices activeSite="til" sites={sites} />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export { Header };
