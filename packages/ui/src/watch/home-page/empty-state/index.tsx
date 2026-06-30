import { CloudUpload } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Query } from 'core';
import { lazy, Suspense, useState } from 'react';

const VideoUploadDialog = lazy(() =>
  import('../../dialogs/upload').then((module) => ({
    default: module.VideoUploadDialog,
  })),
);

// Shown on the home page when the library is empty (loaded, zero videos +
// playlists). The upload call-to-action mirrors the settings UploadButton: it's
// gated by the `upload` feature flag and opens the same VideoUploadDialog.
const WatchEmptyState = () => {
  const [open, setOpen] = useState(false);
  const { featureFlags } = Query.useQueryContext();
  const uploadEnabled = Boolean(featureFlags.data?.['upload']);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        py: { xs: 6, sm: 10 },
        color: 'text.secondary',
      }}
    >
      <CloudUpload sx={{ fontSize: 64, opacity: 0.4 }} />
      <Typography variant="h6" component="p" color="text.primary">
        No videos yet
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        Upload your first video to start building your library.
      </Typography>
      {uploadEnabled && (
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => setOpen(true)}
        >
          Upload a video
        </Button>
      )}

      {open && uploadEnabled && (
        <Suspense fallback={null}>
          <VideoUploadDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </Box>
  );
};

export { WatchEmptyState };
