import Grid from '@mui/material/Grid';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { VideoDetailContainerProps } from './types';
import { VideoContainer } from '../../videos/video-container';
import Typography from '@mui/material/Typography';
import { RelatedList } from '../related-list';
import { StyledRelatedContainer } from './styled';
import React from 'react';

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
  const { queryRs, activeVideoId, onVideoEnded, autoPlay } = props;
  const { isLoading } = queryRs;
  const shouldPlayNextRef = React.useRef(autoPlay);

  // Update ref whenever autoPlay prop changes
  React.useEffect(() => {
    shouldPlayNextRef.current = autoPlay;
  }, [autoPlay]);

  if (isLoading) {
    return (
      <Grid item sx={{ width: '100%', px: 2 }}>
        <MainContentSkeleton />
      </Grid>
    );
  }

  const videoDetail = queryRs.videos.find(video => video.id === activeVideoId);
  if (!videoDetail) {
    // TODO: handle error
    return null;
  }

  const handleVideoEnd = () => {
    if (!onVideoEnded) return;

    const currentIndex = queryRs.videos.findIndex(video => video.id === activeVideoId);
    const nextVideo = queryRs.videos[currentIndex + 1];

    if (!nextVideo) return;

    if (shouldPlayNextRef.current) {
      onVideoEnded(nextVideo);
    }
  };

  return (
    <Grid item sx={{ width: '100%', px: 2 }}>
      <VideoContainer
        video={videoDetail}
        onError={(err: unknown) => {
          console.log(err);
        }}
        onEnded={handleVideoEnd}
      />
      <Typography
        component="h1"
        variant="h4"
        sx={{
          my: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {videoDetail.title}
      </Typography>
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
        <MainContent
          queryRs={props.queryRs}
          activeVideoId={props.activeVideoId}
          LinkComponent={props.LinkComponent}
          onVideoEnded={handleVideoEnded}
          autoPlay={autoPlay}
        />
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
