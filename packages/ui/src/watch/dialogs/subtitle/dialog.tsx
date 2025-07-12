import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import type { SubtitleDialogProps } from './types';

export const SubtitleDialog: React.FC<SubtitleDialogProps> = ({
  open,
  onClose,
  onSave,
  currentUrl,
}) => {
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setUrl(currentUrl || '');
    }
  }, [open, currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Subtitle URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subtitle URL"
            fullWidth
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/subtitles/english.vtt"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

SubtitleDialog.displayName = 'SubtitleDialog';
