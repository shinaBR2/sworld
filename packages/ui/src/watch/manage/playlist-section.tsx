import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  PlaylistEditDialog,
  type PlaylistFormValues,
} from './playlist-edit-dialog';
import type { ManagePlaylist, PlaylistCreate, PlaylistEdit } from './types';

interface PlaylistSectionProps {
  isLoading: boolean;
  playlists: ManagePlaylist[];
  onCreatePlaylist: (input: PlaylistCreate) => void;
  onUpdatePlaylist: (input: PlaylistEdit) => void;
}

const PlaylistSection = (props: PlaylistSectionProps) => {
  const { isLoading, playlists, onCreatePlaylist, onUpdatePlaylist } = props;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagePlaylist | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (playlist: ManagePlaylist) => {
    setEditing(playlist);
    setFormOpen(true);
  };

  const handleSubmit = (values: PlaylistFormValues) => {
    if (editing) {
      onUpdatePlaylist({ id: editing.id, ...values });
    } else {
      onCreatePlaylist(values as PlaylistCreate);
    }
  };

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Playlists ({playlists.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          New playlist
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : playlists.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You have no playlists yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {playlists.map((playlist) => (
            <Paper key={playlist.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1">{playlist.title}</Typography>
                  {playlist.description ? (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {playlist.description}
                    </Typography>
                  ) : null}
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label={`Edit ${playlist.title}`}
                    onClick={() => openEdit(playlist)}
                  >
                    <Edit />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <PlaylistEditDialog
        open={formOpen}
        playlist={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export { PlaylistSection };
