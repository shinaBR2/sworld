import Grid from '@mui/material/Grid';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { VideoDetailContainerProps } from './types';
import { VideoContainer } from '../../videos/video-container';
import Typography from '@mui/material/Typography';
import { RelatedList } from '../related-list';
import { StyledRelatedContainer } from './styled';

import { IconButton, Stack, Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import React, { Suspense } from 'react';
import { getDisplayLanguage } from './utils';

const ShareDialog = React.lazy(() =>
  import('../../dialogs/share').then(mod => ({
    default: mod.ShareDialog,
  }))
);

const SubtitleDialog = React.lazy(() =>
  import('../../dialogs/subtitle').then(mod => ({
    default: mod.SubtitleDialog,
  }))
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
  const { queryRs, activeVideoId, onVideoEnded, autoPlay, onShare } = props;
  const { isLoading, videos } = queryRs;

  // All hooks at the top
  const shouldPlayNextRef = React.useRef(autoPlay);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [isSubtitleDialogOpen, setIsSubtitleDialogOpen] = React.useState(false);

  const videoDetail = React.useMemo(() => videos.find(video => video.id === activeVideoId), [videos, activeVideoId]);

  React.useEffect(() => {
    shouldPlayNextRef.current = autoPlay;
  }, [autoPlay]);

  const handleVideoEnd = React.useCallback(() => {
    if (!onVideoEnded || !videoDetail) return;

    const currentIndex = videos.findIndex(video => video.id === activeVideoId);
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
    [onShare]
  );

  const handleSaveSubtitle = React.useCallback((url: string) => {
    console.log('Saving subtitle URL:', url);
    setIsSubtitleDialogOpen(false);
  }, []);

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
      <VideoContainer
        video={videoDetail}
        onError={(err: unknown) => {
          console.log(err);
        }}
        onEnded={handleVideoEnd}
      />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
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
          {videoDetail.title}
        </Typography>
        {onShare && (
          <Tooltip title="Share video">
            <IconButton onClick={() => setShareDialogOpen(true)} size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edit subtitle">
          <IconButton onClick={() => setIsSubtitleDialogOpen(true)} size="small" sx={{ ml: 1 }}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {videoDetail.subtitles && videoDetail.subtitles.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            Subtitle(s):
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {videoDetail.subtitles.map(subtitle => (
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
        <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} onShare={handleShare} />
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
  props: VideoDetailContainerProps & { autoPlay: boolean; onAutoPlayChange: (checked: boolean) => void }
) => {
  const { queryRs, activeVideoId, LinkComponent, autoPlay, onAutoPlayChange } = props;
  const { videos, playlist, isLoading } = queryRs;

  if (isLoading) {
    return <RelatedContentSkeleton />;
  }

  const videoDetail = queryRs.videos.find(video => video.id === activeVideoId);
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
      <Grid container item alignItems="center" xs={12} sm={6} md={8} lg={9}>
        <MainContent {...props} onVideoEnded={handleVideoEnded} autoPlay={autoPlay} />
      </Grid>
      <Grid container direction="column" item xs={12} sm={6} md={4} lg={3}>
        <StyledRelatedContainer>
          <RelatedContent {...props} autoPlay={autoPlay} onAutoPlayChange={setAutoPlay} />
        </StyledRelatedContainer>
      </Grid>
    </Grid>
  );
};

export { VideoDetailContainer };
