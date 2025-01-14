import Grid from '@mui/material/Grid';
import { VideoDetailContainerProps } from '../../../videos/interface';
import { RelatedList } from '../../related-list';
import { VideoPlayer } from '../../../videos/video-player';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';
import { HEADER_DESKTOP_HEIGHT } from '../../../theme';

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
    aria-label="Loading video player"
  >
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

const SKELETON_ITEMS_COUNT = 6;

const RelatedListSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {/* Title skeleton */}
    <Skeleton
      aria-label="Loading related videos"
      variant="text"
      width={120}
      height={32}
      sx={{ mb: 2 }}
    />

    {/* Related videos list */}
    {Array.from(new Array(SKELETON_ITEMS_COUNT)).map((_, index) => (
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
  const { videoDetail, videos, isLoading } = queryRs;

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
        {/* @ts-ignore */}
        <VideoPlayer video={videoDetail} />
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
