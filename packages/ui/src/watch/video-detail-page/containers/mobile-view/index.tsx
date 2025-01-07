import Grid from '@mui/material/Grid';
import { Video, VideoDetailContainerProps } from '../../../videos/interface';
import { VideoPlayer } from '../../../videos/video-player';
import { RelatedList } from '../../related-list';
import Skeleton from '@mui/material/Skeleton';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';
import Box from '@mui/material/Box';
import { HEADER_MOBILE_HEIGHT, VIDEO_ASPECT_RATIO } from '../../../theme';

// TODO: check orientation events
const styles = {
  container: {
    flex: 1,
    minHeight: 0,
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_ASPECT_RATIO,
  },
  scrollableList: {
    overflow: 'auto',
    height: `calc(100vh - ${VIDEO_ASPECT_RATIO} - ${HEADER_MOBILE_HEIGHT}px)`,
  },
} as const;

<<<<<<< Updated upstream
=======
const SKELETON_ITEMS_COUNT = 5;

>>>>>>> Stashed changes
const LoadingSkeleton = () => (
  <Grid container direction="row" sx={styles.container}>
    <Grid sx={styles.videoContainer}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
      />
    </Grid>
    <Grid item xs={12} sx={styles.scrollableList}>
      <Box px={2}>
<<<<<<< Updated upstream
        {[...Array(5)].map((_, index) => (
=======
        {[...Array(SKELETON_ITEMS_COUNT)].map((_, index) => (
>>>>>>> Stashed changes
          <VideoListItemSkeleton key={index} />
        ))}
      </Box>
    </Grid>
  </Grid>
);

const MobileView = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videoDetail, videos, isLoading } = queryRs;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Grid container direction="row" sx={styles.container}>
      <Grid sx={styles.videoContainer}>
        <VideoPlayer video={videoDetail as Video} />
      </Grid>

      <Grid item xs={12} sx={styles.scrollableList}>
        <RelatedList
          videos={videos}
          title="other videos"
          LinkComponent={LinkComponent}
        />
      </Grid>
    </Grid>
  );
};

export { MobileView };
