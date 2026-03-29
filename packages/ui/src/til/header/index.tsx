import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
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
    <AppBar position="sticky" color="default" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Logo LinkComponent={LinkComponent} />
            <SiteChoices activeSite="til" sites={sites} />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export { Header };
