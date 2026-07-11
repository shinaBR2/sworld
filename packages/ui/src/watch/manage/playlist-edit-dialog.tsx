import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import type { ManagePlaylist } from './types';

interface PlaylistFormValues {
  title: string;
  description: string;
}

interface PlaylistEditDialogProps {
  open: boolean;
  playlist: ManagePlaylist | null;
  onClose: () => void;
  onSubmit: (values: PlaylistFormValues) => void;
}

const PlaylistEditDialog = (props: PlaylistEditDialogProps) => {
  const { open, playlist, onClose, onSubmit } = props;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(playlist?.title ?? '');
      setDescription(playlist?.description ?? '');
    }
  }, [open, playlist]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, description: description.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{playlist ? 'Edit playlist' : 'New playlist'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Title"
            fullWidth
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim()}
        >
          {playlist ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { PlaylistEditDialog };
export type { PlaylistFormValues };
