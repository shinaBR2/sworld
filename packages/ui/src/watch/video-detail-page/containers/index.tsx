import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ShareIcon from '@mui/icons-material/Share';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'core/providers/auth';
import { useCreateSignedUploadUrl } from 'core/watch/mutation-hooks/create-signed-upload-url';
import { useSaveSubtitle } from 'core/watch/mutation-hooks/save-subtitle';
// Server-side ffmpeg thumbnail action. Kept available as a fallback but no
// longer the primary path — it's unreliable (Hono cold start + Linux ffmpeg
// seek quirks). The click now captures the frame in the browser instead.
import { useSetVideoThumbnail } from 'core/watch/mutation-hooks/set-video-thumbnail';
import { useSetVideoThumbnailUrl } from 'core/watch/mutation-hooks/set-video-thumbnail-url';
import React, { Suspense } from 'react';
import { getMediaDisplayName } from '../../utils';
import { VideoContainer } from '../../videos/video-container';
import { RelatedList } from '../related-list';
import {
  captureFrameBlob,
  TaintedCanvasError,
  uploadBlob,
} from './capture-thumbnail';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { StyledRelatedContainer } from './styled';
import type { VideoDetailContainerProps } from './types';
import { getDisplayLanguage } from './utils';

const ShareDialog = React.lazy(() =>
  import('../../dialogs/share').then((mod) => ({
    default: mod.ShareDialog,
  })),
);

const SubtitleDialog = React.lazy(() =>
  import('../../dialogs/subtitle').then((mod) => ({
    default: mod.SubtitleDialog,
  })),
);
// We use a ref instead of state here because of how video.js event handlers work:
//
// 1. When video.js initializes, it sets up event handlers and keeps them for the entire
//    video lifecycle. These handlers capture the values from their closure when created.
//
// 2. If we used state directly in the event handler, it would capture the initial state
//    value and never see updates. This is because video.js keeps the SAME handler function,
//    it doesn't get the new ones React creates on re-renders.
//
// 3. Refs solve this because:
//    - They're mutable, so we can update them when autoPlay changes
//    - They're stable (same object reference), so the old handler can still read new values
//    - The handler reads .current at call time, not creation time
//
// This is a common pattern when integrating React with external libraries that set up
// long-lived event handlers.

const MainContent = (props: VideoDetailContainerProps) => {
  const {
    queryRs,
    activeVideoId,
    onVideoEnded,
    autoPlay,
    onShare,
    onNotify,
    onThumbnailUpdated,
  } = props;
  const { isLoading, videos, playlist } = queryRs;
  const isPlaylist = Boolean(playlist);

  const { getAccessToken, user } = useAuthContext();

  // All hooks at the top
  const shouldPlayNextRef = React.useRef(autoPlay);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [isSubtitleDialogOpen, setIsSubtitleDialogOpen] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  // Filled by the player with a getter for the current playback time (seconds).
  const getCurrentTimeRef = React.useRef<(() => number | null) | null>(null);
  // Filled by the player with a getter for the underlying <video> element, used
  // to draw the paused frame to a canvas for client-side thumbnail capture.
  const getVideoElementRef = React.useRef<
    (() => HTMLVideoElement | null) | null
  >(null);
  // Guards against overlapping captures if the button is clicked repeatedly.
  const isCapturingRef = React.useRef(false);

  const videoDetail = React.useMemo(
    () => videos.find((video) => video.id === activeVideoId),
    [videos, activeVideoId],
  );

  const isOwner = Boolean(user?.id) && videoDetail?.userId === user?.id;

  // Fallback server action (ffmpeg). Retained for reference/emergency use; the
  // primary flow below captures the frame in the browser and uploads it.
  useSetVideoThumbnail({ getAccessToken });

  const { mutateAsync: createSignedUploadUrl } = useCreateSignedUploadUrl({
    getAccessToken,
  });
  const { mutateAsync: setVideoThumbnailUrl } = useSetVideoThumbnailUrl({
    getAccessToken,
  });

  const handleSetThumbnail = React.useCallback(async () => {
    if (!videoDetail || isCapturingRef.current) return;

    const videoEl = getVideoElementRef.current?.();
    if (!videoEl) {
      onNotify?.({ message: 'Failed to update thumbnail', severity: 'error' });
      return;
    }

    isCapturingRef.current = true;
    try {
      // 1. Capture + downscale the current frame to a JPEG blob.
      const blob = await captureFrameBlob(videoEl);

      // 2. Ask the backend for a signed PUT URL scoped to this video.
      const signed = await createSignedUploadUrl({
        input: {
          site: 'watch',
          action: 'VIDEO_THUMBNAIL_UPLOAD',
          id: videoDetail.id,
          contentType: 'image/jpeg',
        },
      });
      const dataObject = signed.createSignedUploadUrl.dataObject;
      if (!dataObject) {
        throw new Error('No signed upload URL returned');
      }

      // 3. Upload the blob straight to the bucket.
      await uploadBlob({ uploadUrl: dataObject.uploadUrl, blob });

      // 4. Persist the thumbnail against the video record.
      await setVideoThumbnailUrl({
        input: { videoId: videoDetail.id, objectPath: dataObject.objectPath },
      });

      // 5. Refetch (route owns the query key) so the new thumbnail shows.
      onThumbnailUpdated?.();
      onNotify?.({ message: 'Thumbnail updated', severity: 'success' });
    } catch (error) {
      // A tainted canvas is a distinct, actionable failure (CORS), so surface
      // its specific message; everything else gets the generic error.
      const message =
        error instanceof TaintedCanvasError
          ? error.message
          : 'Failed to update thumbnail';
      onNotify?.({ message, severity: 'error' });
    } finally {
      isCapturingRef.current = false;
    }
  }, [
    videoDetail,
    createSignedUploadUrl,
    setVideoThumbnailUrl,
    onThumbnailUpdated,
    onNotify,
  ]);

  React.useEffect(() => {
    shouldPlayNextRef.current = autoPlay;
  }, [autoPlay]);

  const handleVideoEnd = React.useCallback(() => {
    if (!onVideoEnded || !videoDetail) return;

    const currentIndex = videos.findIndex(
      (video) => video.id === activeVideoId,
    );
    const nextVideo = videos[currentIndex + 1];

    if (!nextVideo) return;

    if (shouldPlayNextRef.current) {
      onVideoEnded(nextVideo);
    }
  }, [onVideoEnded, videos, activeVideoId, videoDetail]);

  const handleShare = React.useCallback(
    (emails: string[]) => {
      onShare?.(emails);
      setShareDialogOpen(false);
    },
    [onShare],
  );

  const { mutateAsync: saveSubtitle } = useSaveSubtitle({
    getAccessToken,
    onSuccess: (data) => {
      console.log('Subtitle saved successfully:', data);
      // TODO: Add success notification
    },
    onError: (error) => {
      console.error('Failed to save subtitle:', error);
      // TODO: Add error notification
    },
  });

  const handleSaveSubtitle = React.useCallback(
    async (url: string) => {
      // TODO: handle caes multiple subtitles
      if (!videoDetail?.subtitles?.[0]?.id) {
        console.error('No subtitle ID found');
        return;
      }

      await saveSubtitle({
        id: videoDetail.subtitles[0].id,
        object: {
          urlInput: url,
        },
      });

      setIsSubtitleDialogOpen(false);
    },
    [saveSubtitle, videoDetail?.subtitles],
  );

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <Grid item sx={{ width: '100%', px: 2 }}>
        <MainContentSkeleton />
      </Grid>
    );
  }

  if (!videoDetail) {
    return null;
  }

  return (
    <Grid item sx={{ width: '100%', px: 2 }}>
      <Box
        sx={{
          width: '100%',
          // Cap the player so its 16:9 height never exceeds the viewport
          // minus room for the header and the title/actions row below it.
          maxWidth: 'calc((100vh - 220px) * 16 / 9)',
          mx: 'auto',
        }}
      >
        <VideoContainer
          video={videoDetail}
          onError={(err: unknown) => {
            console.log(err);
          }}
          onEnded={handleVideoEnd}
          onPausedChange={setIsPaused}
          getCurrentTimeRef={getCurrentTimeRef}
          getVideoElementRef={getVideoElementRef}
        />
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        {isPlaylist && (
          <Tooltip title="Playlist">
            <PlaylistPlayIcon color="action" titleAccess="Playlist" />
          </Tooltip>
        )}
        <Typography
          component="h1"
          variant="h4"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {getMediaDisplayName({
            videoTitle: videoDetail.title,
            playlistName: playlist?.title,
          })}
        </Typography>
        {isOwner && isPaused && (
          <Tooltip title="Set as thumbnail">
            <IconButton
              onClick={handleSetThumbnail}
              size="small"
              aria-label="Set as thumbnail"
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
        )}
        {onShare && (
          <Tooltip title="Share video">
            <IconButton onClick={() => setShareDialogOpen(true)} size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edit subtitle">
          <IconButton
            onClick={() => setIsSubtitleDialogOpen(true)}
            size="small"
            sx={{ ml: 1 }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {videoDetail.subtitles && videoDetail.subtitles.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            Subtitle(s):
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {videoDetail.subtitles.map((subtitle) => (
              <Chip
                key={subtitle.id}
                label={getDisplayLanguage(subtitle.lang)}
                size="small"
                variant="outlined"
                sx={{
                  '& .MuiChip-label': {
                    textTransform: 'capitalize',
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>
      )}

      <Suspense fallback={null}>
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          onShare={handleShare}
        />
        <SubtitleDialog
          open={isSubtitleDialogOpen}
          onClose={() => setIsSubtitleDialogOpen(false)}
          onSave={handleSaveSubtitle}
          currentUrl={videoDetail.subtitles?.[0]?.src}
        />
      </Suspense>
    </Grid>
  );
};

const RelatedContent = (
  props: VideoDetailContainerProps & {
    autoPlay: boolean;
    onAutoPlayChange: (checked: boolean) => void;
  },
) => {
  const { queryRs, activeVideoId, LinkComponent, autoPlay, onAutoPlayChange } =
    props;
  const { videos, playlist, isLoading } = queryRs;

  if (isLoading) {
    return <RelatedContentSkeleton />;
  }

  const videoDetail = queryRs.videos.find(
    (video) => video.id === activeVideoId,
  );
  if (!videoDetail) {
    // TODO: handle error
    return null;
  }

  return (
    <RelatedList
      videos={videos}
      playlist={playlist}
      title={playlist ? 'Same playlist' : 'Other videos'}
      activeId={videoDetail.id}
      LinkComponent={LinkComponent}
      autoPlay={autoPlay}
      onAutoPlayChange={onAutoPlayChange}
    />
  );
};

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const { onVideoEnded } = props;
  const [autoPlay, setAutoPlay] = React.useState(true);

  const handleVideoEnded = (nextVideo: { id: string; slug: string }) => {
    onVideoEnded?.(nextVideo);
  };

  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      <Grid container item alignItems="flex-start" xs={12} sm={6} md={8} lg={9}>
        <MainContent
          {...props}
          onVideoEnded={handleVideoEnded}
          autoPlay={autoPlay}
        />
      </Grid>
      <Grid container direction="column" item xs={12} sm={6} md={4} lg={3}>
        <StyledRelatedContainer>
          <RelatedContent
            {...props}
            autoPlay={autoPlay}
            onAutoPlayChange={setAutoPlay}
          />
        </StyledRelatedContainer>
      </Grid>
    </Grid>
  );
};

export { VideoDetailContainer };
