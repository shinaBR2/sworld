import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Auth } from 'core';
import { useState } from 'react';
import { FullWidthContainer } from '../../../universal';
import { Header } from '../../../universal/header';
import { MainContainer } from '../home/main-container';
import { SettingsPanel } from '../home/settings';
import { AudioSection } from './audio-section';
import { PlaylistSection } from './playlist-section';
import type {
  AudioEdit,
  FeelingRef,
  ManageAudio,
  ManageFeeling,
  ManagePlaylist,
  PlaylistCreate,
  PlaylistEdit,
} from './types';

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
  isLoading: boolean;
  audios: ManageAudio[];
  feelings: ManageFeeling[];
  playlists: ManagePlaylist[];
  onUpdateAudio: (input: AudioEdit) => void;
  onDeleteAudio: (id: string) => void;
  onAssignFeeling: (input: FeelingRef) => void;
  onUnassignFeeling: (input: FeelingRef) => void;
  onCreatePlaylist: (input: PlaylistCreate) => void;
  onUpdatePlaylist: (input: PlaylistEdit) => void;
  onDeletePlaylist: (id: string) => void;
  onOpenPlaylist: (id: string) => void;
}

/**
 * The listen management dashboard (SWO-411). A signed-in, user-only screen for
 * managing your own library: edit/delete audios and their feelings, and CRUD
 * your own playlists. It shares the app header and settings panel with the
 * player screens; the Logo is the way back to the player.
 */
const ManageScreen = (props: ManageScreenProps) => {
  const {
    sites,
    user,
    onLogout,
    isLoading,
    audios,
    feelings,
    playlists,
    onUpdateAudio,
    onDeleteAudio,
    onAssignFeeling,
    onUnassignFeeling,
    onCreatePlaylist,
    onUpdatePlaylist,
    onDeletePlaylist,
    onOpenPlaylist,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <FullWidthContainer>
      <Header
        user={user}
        onAvatarClick={() => setSettingsOpen(true)}
        siteChoices={{ sites, activeSite: 'listen' }}
      />
      <SettingsPanel
        open={settingsOpen}
        toggle={setSettingsOpen}
        actions={{ logout: onLogout }}
      />
      <MainContainer>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Manage library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Edit your audios and feelings, and organise your playlists.
          </Typography>
        </Box>
        <Stack spacing={6} sx={{ pb: 8 }}>
          <AudioSection
            isLoading={isLoading}
            audios={audios}
            feelings={feelings}
            onUpdateAudio={onUpdateAudio}
            onDeleteAudio={onDeleteAudio}
            onAssignFeeling={onAssignFeeling}
            onUnassignFeeling={onUnassignFeeling}
          />
          <PlaylistSection
            isLoading={isLoading}
            playlists={playlists}
            onCreatePlaylist={onCreatePlaylist}
            onUpdatePlaylist={onUpdatePlaylist}
            onDeletePlaylist={onDeletePlaylist}
            onOpenPlaylist={onOpenPlaylist}
          />
        </Stack>
      </MainContainer>
    </FullWidthContainer>
  );
};

export { ManageScreen };
export type { ManageScreenProps };
