import { CloudUpload } from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { Auth, Query, watchMutationHooks } from 'core';
import { lazy, Suspense, useState } from 'react';

const VideoUploadDialog = lazy(() => import('../../../dialogs/upload'));
const { useBulkConvertVideos } = watchMutationHooks;

const UploadButton = () => {
  const [open, setOpen] = useState(false);
  const { user, getAccessToken } = Auth.useAuthContext();
  const { featureFlags } = Query.useQueryContext();
  const { mutate: bulkConvert } = useBulkConvertVideos({
    getAccessToken,
    onSuccess: data => {
      console.log('Videos converted:', data.insert_videos.returning);
    },
  });

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
        <ListItemText primary="Upload" />
      </ListItemButton>

      {open && (
        <Suspense fallback={null}>
          <VideoUploadDialog
            open={open}
            onOpenChange={setOpen}
            onSubmit={async urls => {
              if (!enabled) {
                return;
              }

              console.log(`submit url`, urls);
              bulkConvert({
                objects: urls.map((url, index) => {
                  const now = Date.now();

                  return {
                    title: `untitled-${now}`,
                    description: `description-${now} for url ${url}`,
                    slug: `untitled-${user?.id}-${index}-${now}`,
                    video_url: url,
                  };
                }),
              });
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export { UploadButton };
