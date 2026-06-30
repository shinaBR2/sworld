import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { useLoadVideos } from 'core/watch/query-hooks/videos';
import type { RequiredLinkComponent } from '../../videos/types';
import { VideoCard } from '../../videos/video-card';
import { VideoSkeleton } from '../../videos/video-card/skeleton';
import { GRID_COLUMN_PROPS } from '../columns';
import { ContinueWatchingSection } from '../continue-watching';
import { WatchEmptyState } from '../empty-state';
import { genlinkProps } from '../utils';

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => `skeleton-${i}`);

const Loading = () => {
  return (
    <>
      {SKELETON_KEYS.map((key) => (
        <Grid item {...GRID_COLUMN_PROPS} key={key}>
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
  const { videos, continueWatching, isLoading } = queryRs;
  const isEmpty = !isLoading && videos.length === 0;

  return (
    <Container
      maxWidth={false}
      data-scroll-restoration-id="watch-home"
      sx={{ flex: 1, height: 0, py: 3, px: { xs: 2, sm: 3 }, overflow: 'auto' }}
    >
      <ContinueWatchingSection
        videos={continueWatching}
        LinkComponent={LinkComponent}
      />
      {isEmpty ? (
        <WatchEmptyState />
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h2">
              Videos
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {isLoading && <Loading />}
            {!isLoading &&
              videos.map((video) => (
                <Grid item {...GRID_COLUMN_PROPS} key={video.id}>
                  <VideoCard
                    video={video}
                    asLink={true}
                    LinkComponent={LinkComponent}
                    linkProps={genlinkProps(video)}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export { HomeContainer };
