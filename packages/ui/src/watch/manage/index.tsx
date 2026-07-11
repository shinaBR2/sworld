import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Auth } from 'core';
import { lazy, Suspense, useState } from 'react';
import { FullWidthContainer } from '../../universal';
import { Header } from '../../universal/header';
import { SettingsPanel } from '../home-page/settings';
import { SettingsSection } from './settings-section';

const VideoUploadDialog = lazy(() =>
  import('../dialogs/upload').then((module) => ({
    default: module.VideoUploadDialog,
  })),
);

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
  standaloneMode: boolean;
  onStandaloneModeChange: (value: boolean) => void;
  saving?: boolean;
}

const ManageScreen = (props: ManageScreenProps) => {
  const {
    sites,
    user,
    onLogout,
    standaloneMode,
    onStandaloneModeChange,
    saving,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

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
        <Stack spacing={4} sx={{ pb: 8 }}>
          <SettingsSection
            standaloneMode={standaloneMode}
            onChange={onStandaloneModeChange}
            saving={saving}
          />
        </Stack>
      </Box>
      <Fab
        color="secondary"
        aria-label="Import video"
        onClick={() => setUploadOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'secondary.main',
        }}
      >
        <AddIcon />
      </Fab>
      {uploadOpen && (
        <Suspense fallback={null}>
          <VideoUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
        </Suspense>
      )}
    </FullWidthContainer>
  );
};

export { ManageScreen };
export type { ManageScreenProps };
