import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import type { AudioEdit, ManageAudio } from './types';

interface AudioEditDialogProps {
  open: boolean;
  audio: ManageAudio | null;
  onClose: () => void;
  onSave: (input: AudioEdit) => void;
}

const AudioEditDialog = (props: AudioEditDialogProps) => {
  const { open, audio, onClose, onSave } = props;
  const [name, setName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Seed the fields from the audio each time the dialog opens for one.
  useEffect(() => {
    if (audio) {
      setName(audio.name);
      setArtistName(audio.artistName);
      setThumbnailUrl(audio.thumbnailUrl);
    }
  }, [audio]);

  const handleSave = () => {
    if (!audio) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      id: audio.id,
      name: trimmedName,
      artistName: artistName.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit audio</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="Artist"
            fullWidth
            value={artistName}
            onChange={(event) => setArtistName(event.target.value)}
          />
          <TextField
            label="Thumbnail URL"
            fullWidth
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { AudioEditDialog };
