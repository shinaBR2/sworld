import { CloudUpload } from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { Query } from 'core';
import { lazy, Suspense, useState } from 'react';

const VideoUploadDialog = lazy(() =>
  import('../../../dialogs/upload').then(module => ({
    default: module.VideoUploadDialog,
  }))
);

const UploadButton = () => {
  const [open, setOpen] = useState(false);
  const { featureFlags } = Query.useQueryContext();

  const { data, isLoading } = featureFlags;

  if (isLoading) {
    return (
      <ListItemButton disabled aria-disabled="true" aria-label="Upload button loading" role="button">
        <ListItemIcon>
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            aria-hidden="true"
            data-testid="upload-button-skeleton-icon"
          />
        </ListItemIcon>
        <ListItemText primary={<Skeleton width={80} aria-hidden="true" data-testid="upload-button-skeleton-text" />} />
      </ListItemButton>
    );
  }

  const enabled = data?.['upload'];

  return (
    <>
      <ListItemButton
        disabled={!enabled}
        aria-disabled={!enabled}
        aria-label="Upload file"
        role="button"
        onClick={() => setOpen(true)}
      >
        <ListItemIcon>
          <CloudUpload />
        </ListItemIcon>
        <ListItemText primary="Import" />
      </ListItemButton>

      {open && enabled && (
        <Suspense fallback={null}>
          <VideoUploadDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
};

export { UploadButton };
