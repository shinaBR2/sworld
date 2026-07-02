import AddIcon from '@mui/icons-material/Add';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ElementType } from 'react';
import { useState } from 'react';

interface PlaylistSummary {
  id: string;
  title: string;
  slug: string;
}

interface PlaylistLibraryProps {
  queryRs: {
    playlists: PlaylistSummary[];
    isLoading: boolean;
    error?: unknown;
  };
  onCreate: (title: string) => void;
  isCreating?: boolean;
  LinkComponent: ElementType;
}

const PlaylistLibrary = (props: PlaylistLibraryProps) => {
  const { queryRs, onCreate, isCreating, LinkComponent } = props;
  const { playlists, isLoading, error } = queryRs;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');

  const closeDialog = () => {
    setDialogOpen(false);
    setTitle('');
  };

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    closeDialog();
  };

  return (
    <Box py={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" component="h1">
          Playlists
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New playlist
        </Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1} aria-label="loading playlists">
          {Array.from({ length: 4 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : error ? (
        <Typography color="error">
          Something went wrong loading your playlists.
        </Typography>
      ) : playlists.length === 0 ? (
        <Typography color="text.secondary">
          No playlists yet. Create one to start collecting audios.
        </Typography>
      ) : (
        <List aria-label="playlists">
          {playlists.map((playlist) => (
            <ListItemButton
              key={playlist.id}
              component={LinkComponent}
              to="/playlists/$id"
              params={{ id: playlist.id }}
            >
              <ListItemIcon>
                <QueueMusicIcon />
              </ListItemIcon>
              <ListItemText primary={playlist.title} />
            </ListItemButton>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>New playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCreate();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!title.trim() || isCreating}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { PlaylistLibrary };
export type { PlaylistSummary };
