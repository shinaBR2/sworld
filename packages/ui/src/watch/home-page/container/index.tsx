import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import { RequiredLinkComponent } from '../../videos/types';
import { VideoCard } from '../../videos/video-card';
import { genlinkProps } from '../utils';
import { useLoadVideos } from 'core/watch/query-hooks/videos';

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

interface HomeContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadVideos>;
}

// TODO refactor
const HomeContainer = (props: HomeContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;

  return (
    <Container maxWidth={false} sx={{ flex: 1, height: 0, py: 3, px: { xs: 2, sm: 3 }, overflow: 'auto' }}>
      <Grid container spacing={3}>
        {isLoading && <Loading />}
        {!isLoading &&
          videos.map(video => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={video.id}>
              <VideoCard video={video} asLink={true} LinkComponent={LinkComponent} linkProps={genlinkProps(video)} />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export { HomeContainer };
