import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { VideoCard } from '../../videos/video-card';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import type { HistoryContainerProps } from '../types';
import { genlinkProps } from '../utils';

const Loading = () => {
  return (
    <>
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <Grid
            key={i}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <VideoSkeleton />
          </Grid>
        ))}
    </>
  );
};

const HistoryContainer = (props: HistoryContainerProps) => {
  const { videos, isLoading, LinkComponent } = props;

  return (
    <Container
      maxWidth={false}
      data-scroll-restoration-id="watch-history"
      sx={{ flex: 1, height: 0, py: 3, px: { xs: 2, sm: 3 }, overflow: 'auto' }}
    >
      <Grid container spacing={3}>
        {isLoading && <Loading />}
        {!isLoading &&
          videos.map((video) => (
            <Grid
              key={video.id}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
                xl: 2.4,
              }}
            >
              <VideoCard
                video={video}
                asLink={true}
                LinkComponent={LinkComponent}
                linkProps={genlinkProps(video)}
              />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export { HistoryContainer };
