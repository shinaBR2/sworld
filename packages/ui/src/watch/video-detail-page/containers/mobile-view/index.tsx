import Grid from '@mui/material/Grid';
import { VideoDetailContainerProps } from '../../../videos/interface';
import { VideoPlayer } from '../../../videos/video-player';
import { RelatedList } from '../../related-list';
import Skeleton from '@mui/material/Skeleton';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';
import Box from '@mui/material/Box';

const HEADER_MOBILE_HEIGHT = 56;
const VIDEO_ASPECT_RATIO = '56.25vw'; // 16:9 ratio

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
        {[...Array(5)].map((_, index) => (
          <VideoListItemSkeleton key={index} />
        ))}
      </Box>
    </Grid>
  </Grid>
);

const MobileView = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Grid container direction="row" sx={styles.container}>
      <Grid sx={styles.videoContainer}>
        <VideoPlayer video={videos[0]} />
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
