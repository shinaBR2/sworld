import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';
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
  onDeletePlaylist: (id: string) => void;
  onOpenPlaylist: (id: string) => void;
}

const PlaylistSection = (props: PlaylistSectionProps) => {
  const {
    isLoading,
    playlists,
    onCreatePlaylist,
    onUpdatePlaylist,
    onDeletePlaylist,
    onOpenPlaylist,
  } = props;

  const [formOpen, setFormOpen] = useState(false);
  // The playlist being edited; null while the form is in create mode.
  const [editing, setEditing] = useState<ManagePlaylist | null>(null);
  // Kept while the confirm dialog closes so its title doesn't flash to
  // "undefined" during the fade-out; `confirmOpen` drives visibility.
  const [confirmTarget, setConfirmTarget] = useState<ManagePlaylist | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const askDelete = (playlist: ManagePlaylist) => {
    setConfirmTarget(playlist);
    setConfirmOpen(true);
  };

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
      onCreatePlaylist(values);
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
                  <Link
                    component="button"
                    variant="subtitle1"
                    underline="hover"
                    color="inherit"
                    onClick={() => onOpenPlaylist(playlist.id)}
                    sx={{ textAlign: 'left' }}
                  >
                    {playlist.title}
                  </Link>
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
                  <IconButton
                    aria-label={`Delete ${playlist.title}`}
                    onClick={() => askDelete(playlist)}
                  >
                    <Delete />
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
      <ConfirmDialog
        open={confirmOpen}
        title="Delete playlist"
        message={`Delete "${confirmTarget?.title}"? This can't be undone.`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmTarget) onDeletePlaylist(confirmTarget.id);
        }}
      />
    </Box>
  );
};

export { PlaylistSection };
