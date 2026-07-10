import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface ClipboardTabProps {
  onImportClipboard: (text: string) => void;
}

const ClipboardTab = ({ onImportClipboard }: ClipboardTabProps) => {
  const [text, setText] = useState('');

  const handleImport = () => {
    if (text.trim()) {
      onImportClipboard(text.trim());
    }
  };

  return (
    <Box p={2}>
      <Typography color="text.secondary" gutterBottom>
        Paste content below to detect and import.
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={6}
        placeholder="Paste URL, text, or ISBN here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleImport}
        disabled={!text.trim()}
        sx={{ mt: 1 }}
      >
        Import
      </Button>
    </Box>
  );
};

export { ClipboardTab };
