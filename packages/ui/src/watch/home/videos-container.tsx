import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { watchQueryHooks } from 'core';
import { Video, VideoCard } from '../videos/video-card';
import { VideoSkeleton } from '../videos/video-skeleton';

const Loading = () => {
  return (
    <>
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <VideoSkeleton />
          </Grid>
        ))}
    </>
  );
};

const VideosContainer = (
  props: ReturnType<typeof watchQueryHooks.useLoadVideos>
) => {
  const { videos, isLoading } = props;

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {isLoading && <Loading />}
        {!isLoading &&
          videos.map((video: Video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export { VideosContainer };
