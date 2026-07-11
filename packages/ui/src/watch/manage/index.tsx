import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Auth } from 'core';
import { lazy, Suspense, useState } from 'react';
import { FullWidthContainer } from '../../universal';
import { Header } from '../../universal/header';
import { SettingsPanel } from '../home-page/settings';

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

interface ManageVideo {
  id: string;
  title: string;
  source?: string | null;
  slug: string;
  playlistName?: string;
}

interface ManagePlaylist {
  id: string;
  title: string;
  slug: string;
}

interface ManageScreenProps {
  sites: HeaderSites;
  user: Auth.CustomUser | null;
  onLogout: () => void;
  onNavigateSettings?: () => void;
  videos?: ManageVideo[];
  playlists?: ManagePlaylist[];
  onDeleteVideo?: (id: string) => void;
  onDeletePlaylist?: (id: string) => void;
  deletingVideoId?: string | null;
  deletingPlaylistId?: string | null;
}

const ManageScreen = (props: ManageScreenProps) => {
  const {
    sites,
    user,
    onLogout,
    onNavigateSettings,
    videos = [],
    playlists = [],
    onDeleteVideo,
    onDeletePlaylist,
    deletingVideoId,
    deletingPlaylistId,
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
            Import videos and manage your content.
          </Typography>
        </Box>
        <Stack spacing={4} sx={{ pb: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Videos
            </Typography>
            {videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No videos yet.
              </Typography>
            ) : (
              <List disablePadding>
                {videos.map((video) => (
                  <ListItem
                    key={video.id}
                    secondaryAction={
                      onDeleteVideo ? (
                        <IconButton
                          edge="end"
                          aria-label={`Delete ${video.title}`}
                          onClick={() => onDeleteVideo(video.id)}
                          disabled={deletingVideoId === video.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : null
                    }
                  >
                    <ListItemText
                      primary={
                        video.playlistName
                          ? `${video.title} (${video.playlistName})`
                          : video.title
                      }
                      secondary={video.slug}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Playlists
            </Typography>
            {playlists.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No playlists yet.
              </Typography>
            ) : (
              <List disablePadding>
                {playlists.map((playlist) => (
                  <ListItem
                    key={playlist.id}
                    secondaryAction={
                      onDeletePlaylist ? (
                        <IconButton
                          edge="end"
                          aria-label={`Delete ${playlist.title}`}
                          onClick={() => onDeletePlaylist(playlist.id)}
                          disabled={deletingPlaylistId === playlist.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : null
                    }
                  >
                    <ListItemText
                      primary={playlist.title}
                      secondary={playlist.slug}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
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
