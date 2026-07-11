import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Auth } from 'core';
import { useState } from 'react';
import { FullWidthContainer } from '../../universal';
import { Header } from '../../universal/header';
import { SettingsPanel } from '../home-page/settings';

interface HeaderSites {
  main: string;
  listen: string;
  watch: string;
  til: string;
}

interface ManageScreenProps {
  sites: HeaderSites;
  user: Auth.CustomUser | null;
  onLogout: () => void;
}

const ManageScreen = (props: ManageScreenProps) => {
  const { sites, user, onLogout } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <FullWidthContainer>
      <Header
        user={user}
        onAvatarClick={() => setSettingsOpen(true)}
        siteChoices={{ sites, activeSite: 'watch' }}
      />
      <SettingsPanel
        open={settingsOpen}
        toggle={setSettingsOpen}
        actions={{ logout: onLogout }}
      />
      <Box sx={{ maxWidth: 'xl', mx: 'auto', width: '100%', px: 3 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Manage library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Import videos and configure your app experience.
          </Typography>
        </Box>
      </Box>
    </FullWidthContainer>
  );
};

export { ManageScreen };
export type { ManageScreenProps };
