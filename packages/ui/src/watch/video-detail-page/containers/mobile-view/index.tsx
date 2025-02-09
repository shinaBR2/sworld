import Grid from '@mui/material/Grid';
import { Video, VideoDetailContainerProps } from '../../../videos/interface';
import { RelatedList } from '../../related-list';
import Skeleton from '@mui/material/Skeleton';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';
import Box from '@mui/material/Box';
import { HEADER_MOBILE_HEIGHT, VIDEO_ASPECT_RATIO } from '../../../theme';
import { Theme, Typography } from '@mui/material';
import { VideoContainer } from '../../../videos/video-container';

// TODO: check orientation events
const styles = {
  container: {
    flex: 1,
    minHeight: 0,
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_ASPECT_RATIO,
    px: 2,
    py: 2,
  },
  scrollableList: {
    overflow: 'auto',
    pb: 2,
    height: (theme: Theme) => {
      const titleHeight = `calc(${theme.typography.h4.fontSize} * ${theme.typography.h4.lineHeight} * 2)`;
      return `calc(100vh - ${VIDEO_ASPECT_RATIO} - ${HEADER_MOBILE_HEIGHT}px - ${titleHeight} - ${theme.spacing(4)})`; // spacing(2) = 16px for margin-top
    },
  },
  title: {
    mt: 2,
    mb: 2,
    px: 2,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
} as const;

const SKELETON_ITEMS_COUNT = 5;

const LoadingSkeleton = () => (
  <Grid container direction="row" sx={styles.container} aria-busy="true">
    <Grid sx={styles.videoContainer}>
      <Skeleton variant="rounded" width="100%" height="100%" animation="wave" />
    </Grid>
    <Grid item xs={12}>
      <Skeleton
        variant="text"
        width="65%"
        sx={theme => ({
          ...theme.typography.h4,
          mt: 2,
          mx: 2, // px doesn't work
        })}
        animation="wave"
      />
    </Grid>
    <Grid item xs={12} sx={styles.scrollableList}>
      <Skeleton
        variant="text"
        width="30%"
        sx={theme => ({
          ...theme.typography.h6,
          mb: 2,
          mx: 2, // px doesn't work
        })}
        animation="wave"
      />
      <Box px={2}>
        {[...Array(SKELETON_ITEMS_COUNT)].map((_, index) => (
          <VideoListItemSkeleton key={index} />
        ))}
      </Box>
    </Grid>
  </Grid>
);

const MobileView = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;
  const videoDetail = queryRs.videoDetail as Video;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Grid container direction="row" sx={styles.container}>
      <Grid sx={styles.videoContainer}>
        <VideoContainer
          video={videoDetail}
          onError={(err: unknown) => {
            console.log(err);
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography component="h1" variant="h4" sx={styles.title}>
          {videoDetail.title}
        </Typography>
      </Grid>

      <Grid item xs={12} sx={styles.scrollableList}>
        <RelatedList videos={videos} title="other videos" activeId={videoDetail?.id} LinkComponent={LinkComponent} />
      </Grid>
    </Grid>
  );
};

export { MobileView };
