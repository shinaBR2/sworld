import { CloudUpload } from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { Query } from 'core';
import { lazy, Suspense, useState } from 'react';
import { texts } from './texts';

const DeveloperImportDialog = lazy(() =>
  import('../../../dialogs/developer-import').then(module => ({
    default: module.DeveloperImportDialog,
  }))
);

const DeveloperImportButton = () => {
  const [open, setOpen] = useState(false);
  const { featureFlags } = Query.useQueryContext();

  const { data, isLoading } = featureFlags;

  if (isLoading) {
    return (
      <ListItemButton disabled aria-disabled="true" aria-label="Upload button loading" aria-busy="true" role="button">
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

  console.log(`data`, data);
  const enabled = data?.['developer-upload'];

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
        <ListItemText primary={texts.label} />
      </ListItemButton>

      {open && enabled && (
        <Suspense fallback={null}>
          <DeveloperImportDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
};

export { DeveloperImportButton };
