import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

interface CreatePlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  isCreating?: boolean;
}

const CreatePlaylistDialog = (props: CreatePlaylistDialogProps) => {
  const { open, onClose, onCreate, isCreating } = props;
  const [title, setTitle] = useState('');

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!title.trim() || isCreating}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { CreatePlaylistDialog };
export type { CreatePlaylistDialogProps };
