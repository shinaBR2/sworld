import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import type { Auth } from 'core';
import { lazy, Suspense, useState } from 'react';
import { FullWidthContainer } from '../../universal';
import { Header } from '../../universal/header';
import { SettingsPanel } from '../home-page/settings';
import { PlaylistSection } from './playlist-section';
import type {
  ManagePlaylist,
  ManageVideo,
  PlaylistCreate,
  PlaylistEdit,
  ReorderPlaylistVariables,
  VideoEdit,
} from './types';
import { VideoSection } from './video-section';

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
  onNavigateSettings?: () => void;
  isLoading: boolean;
  videos: ManageVideo[];
  playlists: ManagePlaylist[];
  onUpdateVideo: (input: VideoEdit) => void;
  onRepairVideo: (videoId: string) => void;
  onCreatePlaylist: (input: PlaylistCreate) => void;
  onUpdatePlaylist: (input: PlaylistEdit) => void;
  onReorderPlaylist: (input: ReorderPlaylistVariables) => void;
  isRepairDisabled?: boolean;
}

const ManageScreen = (props: ManageScreenProps) => {
  const {
    sites,
    user,
    onLogout,
    onNavigateSettings,
    isLoading,
    videos,
    playlists,
    onUpdateVideo,
    onRepairVideo,
    onCreatePlaylist,
    onUpdatePlaylist,
    onReorderPlaylist,
    isRepairDisabled,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tab, setTab] = useState(0);

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
        actions={{
          logout: onLogout,
          settings: onNavigateSettings,
        }}
      />
      <Box sx={{ maxWidth: 'xl', mx: 'auto', width: '100%', px: 3 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Manage library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Import videos, edit your content, and organise your playlists.
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`Videos (${videos.length})`} />
            <Tab label={`Playlists (${playlists.length})`} />
          </Tabs>
        </Box>
        {tab === 0 && (
          <VideoSection
            isLoading={isLoading}
            videos={videos}
            onUpdateVideo={onUpdateVideo}
            onRepairVideo={onRepairVideo}
            isRepairDisabled={isRepairDisabled}
          />
        )}
        {tab === 1 && (
          <PlaylistSection
            isLoading={isLoading}
            playlists={playlists}
            onCreatePlaylist={onCreatePlaylist}
            onUpdatePlaylist={onUpdatePlaylist}
            onReorderPlaylist={onReorderPlaylist}
          />
        )}
      </Box>
      <Fab
        color="secondary"
        aria-label="Import video"
        onClick={() => setUploadOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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
