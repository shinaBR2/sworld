import Grid from '@mui/material/Grid';
import { Video, VideoDetailContainerProps } from '../../../videos/interface';
import { RelatedList } from '../../related-list';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { VideoListItemSkeleton } from '../../../videos/list-item-skeleton';
import { HEADER_DESKTOP_HEIGHT } from '../../../theme';
import { Typography } from '@mui/material';
import { VideoContainer } from '../../../videos/video-container';

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
    px: 2,
  },
  title: {
    my: 2,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    <Skeleton variant="rounded" width="100%" height="100%" />
  </Box>
);

const SKELETON_ITEMS_COUNT = 6;

const RelatedListSkeleton = () => (
  <Box>
    {/* Title skeleton */}
    <Skeleton aria-label="Loading related videos" variant="text" width={120} height={32} sx={{ mx: 2, mb: 2 }} />

    {/* Related videos list */}
    {Array.from(new Array(SKELETON_ITEMS_COUNT)).map((_, index) => (
      <VideoListItemSkeleton key={index} />
    ))}
  </Box>
);

const DesktopViewSkeleton = () => {
  return (
    <Grid container spacing={2} sx={styles.container}>
      <Grid container item alignItems="center" xs={12} md={8} lg={9} sx={styles.videoContainer}>
        <Box sx={{ width: '100%' }}>
          <VideoPlayerSkeleton />
          <Skeleton
            variant="text"
            width="50%"
            sx={theme => ({
              ...theme.typography.h4,
              my: 2, // px doesn't work
            })}
            animation="wave"
          />
        </Box>
      </Grid>

      <Grid container direction="column" item xs={12} md={4} lg={3} sx={styles.scrollableList}>
        <RelatedListSkeleton />
      </Grid>
    </Grid>
  );
};

const DesktopView = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;
  const videoDetail = queryRs.videoDetail as Video;
  const debug = false;

  if (isLoading || debug) {
    return <DesktopViewSkeleton />;
  }

  return (
    <Grid container spacing={2} sx={styles.container}>
      <Grid container item alignItems="center" xs={12} md={8} lg={9} sx={styles.videoContainer}>
        {videoDetail && (
          <Box sx={{ width: '100%' }}>
            <VideoContainer
              video={videoDetail}
              onError={(err: unknown) => {
                console.log(err);
              }}
            />
            <Typography component="h1" variant="h4" sx={styles.title}>
              {videoDetail.title}
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid container direction="column" item xs={12} md={4} lg={3} sx={styles.scrollableList}>
        <RelatedList videos={videos} title="other videos" activeId={videoDetail?.id} LinkComponent={LinkComponent} />
      </Grid>
    </Grid>
  );
};

export { DesktopView };
