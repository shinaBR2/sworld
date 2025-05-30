import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import type { ShareDialogProps } from './types';

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  onShare,
}) => {
  const [emails, setEmails] = React.useState('');

  const handleShare = () => {
    const emailList = emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email !== '');
    onShare(emailList);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Video</DialogTitle>
      <DialogContent sx={{ pt: 2, '& .MuiTextField-root': { mt: 1 } }}>
        <TextField
          autoFocus
          margin="dense"
          label="Email addresses"
          fullWidth
          variant="outlined"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter email addresses separated by commas"
          helperText="Enter multiple email addresses separated by commas"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare} variant="contained" color="primary">
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
};
