import Grid from '@mui/material/Grid';
import { VideoDetailContainerProps } from '../../../videos/interface';
import { RelatedList } from '../../related-list';
import { VideoPlayer } from '../../../videos/video-player';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';

const HEADER_DESKTOP_HEIGHT = 64;

const styles = {
  container: {
    flex: 1,
    ml: 0,
    mt: 0,
    height: 0,
  },
  videoContainer: {
    height: `calc(100vh - ${HEADER_DESKTOP_HEIGHT}px)`,
  },
  scrollableList: {
    height: `calc(100vh - ${HEADER_DESKTOP_HEIGHT}px)`,
    overflow: 'auto',
  },
} as const;

const VideoPlayerSkeleton = () => (
  <Box
    sx={{
      width: '100%',
      height: 'auto',
      aspectRatio: '16/9',
    }}
  >
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

const RelatedListSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {/* Title skeleton */}
    <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />

    {/* Related videos list */}
    {Array.from(new Array(6)).map((_, index) => (
      <VideoListItemSkeleton key={index} />
    ))}
  </Box>
);

const DesktopViewSkeleton = () => {
  return (
    <Grid container spacing={2} sx={styles.container}>
      <Grid
        container
        item
        alignItems="center"
        xs={12}
        md={8}
        lg={9}
        sx={styles.videoContainer}
      >
        <VideoPlayerSkeleton />
      </Grid>

      <Grid
        container
        direction="column"
        item
        xs={12}
        md={4}
        lg={3}
        sx={styles.scrollableList}
      >
        <RelatedListSkeleton />
      </Grid>
    </Grid>
  );
};

const DesktopView = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;

  if (isLoading) {
    return <DesktopViewSkeleton />;
  }

  return (
    <Grid container spacing={2} sx={styles.container}>
      <Grid
        container
        item
        alignItems="center"
        xs={12}
        md={8}
        lg={9}
        sx={styles.videoContainer}
      >
        <VideoPlayer video={videos[0]} />
      </Grid>

      <Grid
        container
        direction="column"
        item
        xs={12}
        md={4}
        lg={3}
        sx={styles.scrollableList}
      >
        <RelatedList
          videos={videos}
          title="other videos"
          LinkComponent={LinkComponent}
        />
      </Grid>
    </Grid>
  );
};

export { DesktopView };
