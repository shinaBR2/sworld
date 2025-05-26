import Grid from '@mui/material/Grid';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { VideoDetailContainerProps } from './types';
import { VideoContainer } from '../../videos/video-container';
import Typography from '@mui/material/Typography';
import { RelatedList } from '../related-list';
import { StyledRelatedContainer } from './styled';
import React from 'react';

const MainContent = (props: VideoDetailContainerProps) => {
  const { queryRs, activeVideoId } = props;
  const { isLoading } = queryRs;

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
    const currentIndex = queryRs.videos.findIndex(video => video.id === activeVideoId);
    const nextVideo = queryRs.videos[currentIndex + 1];

    if (!nextVideo) return; // No more videos to play

    props.onVideoEnded?.(nextVideo);
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
  const [autoPlay, setAutoPlay] = React.useState(true);
  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      <Grid container item alignItems="center" xs={12} sm={6} md={8} lg={9}>
        <MainContent
          {...props}
          onVideoEnded={nextVideo => {
            if (autoPlay) {
              props.onVideoEnded?.(nextVideo);
            }
          }}
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
