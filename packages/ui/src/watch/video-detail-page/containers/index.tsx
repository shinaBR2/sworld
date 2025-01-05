import Grid from '@mui/material/Grid';
import { useIsMobile } from '../../../universal/responsive';
import { RelatedList } from '../related-list';
import { VideoDetailContainerProps } from '../../videos/interface';
import { VideoPlayer } from '../../videos/video-player';

const HEADER_DESKTOP_HEIGHT = 64;
const HEADER_MOBILE_HEIGHT = 64;
const VIDEO_ASPECT_RATIO = '56.25vw'; // 16:9 ratio

const styles = {
  container: {
    flex: 1,
    minHeight: 0,
  },
  mobileVideoContainer: {
    height: VIDEO_ASPECT_RATIO,
  },
  mobileScrollableList: {
    overflow: 'auto',
    height: `calc(100vh - ${VIDEO_ASPECT_RATIO} - ${HEADER_MOBILE_HEIGHT}px)`,
  },
  desktopContainer: {
    flex: 1,
    ml: 0,
    mt: 0,
    height: 0,
  },
  desktopVideoContainer: {
    height: `calc(100vh - ${HEADER_DESKTOP_HEIGHT}px)`,
  },
  desktopScrollableList: {
    height: `calc(100vh - ${HEADER_DESKTOP_HEIGHT}px)`,
    overflow: 'auto',
  },
} as const;

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;
  const isMobile = useIsMobile();

  if (isLoading) {
    return 'is Loading';
  }

  if (isMobile) {
    return (
      <Grid container direction="row" sx={styles.container}>
        <Grid sx={styles.mobileVideoContainer}>
          <VideoPlayer video={videos[0]} />
        </Grid>

        <Grid item xs={12} sx={styles.mobileScrollableList}>
          <RelatedList
            videos={videos}
            title="other videos"
            LinkComponent={LinkComponent}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={styles.desktopContainer}>
      <Grid
        container
        item
        alignItems="center"
        xs={12}
        md={8}
        lg={9}
        sx={styles.desktopVideoContainer}
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
        sx={styles.desktopScrollableList}
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

export { VideoDetailContainer };
