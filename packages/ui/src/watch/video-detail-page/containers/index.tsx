import Grid from '@mui/material/Grid';
import { MainContentSkeleton, RelatedContentSkeleton } from './skeleton';
import { VideoDetailContainerProps } from './types';
import { VideoContainer } from '../../videos/video-container';
import Typography from '@mui/material/Typography';
import { RelatedList } from '../related-list';
import { StyledRelatedContainer } from './styled';

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

  return (
    <Grid item sx={{ width: '100%', px: 2 }}>
      <VideoContainer
        video={videoDetail}
        onError={(err: unknown) => {
          console.log(err);
        }}
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

const RelatedContent = (props: VideoDetailContainerProps) => {
  const { queryRs, activeVideoId, LinkComponent } = props;
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
    />
  );
};

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      <Grid container item alignItems="center" xs={12} sm={6} md={8} lg={9}>
        <MainContent {...props} />
      </Grid>
      <Grid container direction="column" item xs={12} sm={6} md={4} lg={3}>
        <StyledRelatedContainer>
          <RelatedContent {...props} />
        </StyledRelatedContainer>
      </Grid>
    </Grid>
  );
};

export { VideoDetailContainer };
