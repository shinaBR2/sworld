import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import type { ManageVideo, VideoEdit } from './types';

interface VideoEditDialogProps {
  open: boolean;
  video: ManageVideo | null;
  onClose: () => void;
  onSave: (input: VideoEdit) => void;
  onRepair: (videoId: string) => void;
  isRepairDisabled?: boolean;
}

const VideoEditDialog = (props: VideoEditDialogProps) => {
  const { open, video, onClose, onSave, onRepair, isRepairDisabled } = props;
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (open && video) {
      setTitle(video.title);
      setThumbnailUrl(video.thumbnailUrl ?? '');
    }
  }, [open, video]);

  const handleSave = () => {
    if (!video) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({
      id: video.id,
      title: trimmedTitle,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    });
    onClose();
  };

  const handleRepair = () => {
    if (!video) return;
    onRepair(video.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit video</DialogTitle>
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
            label="Thumbnail URL"
            fullWidth
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
          />
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            disabled={isRepairDisabled}
            onClick={handleRepair}
          >
            Fix video (repair fMP4)
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { VideoEditDialog };
