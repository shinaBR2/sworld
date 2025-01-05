import Grid from '@mui/material/Grid';
import { useIsMobile } from '../../../universal/responsive';
import { RelatedList } from '../related-list';
import { VideoDetailContainerProps } from '../../videos/interface';
import { VideoPlayer } from '../../videos/video-player';

const HEADER_DESKTOP_HEIGHT = 64;
const HEADER_MOBILE_HEIGHT = 64;

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;
  const isMobile = useIsMobile();

  if (isLoading) {
    return 'is Loading';
  }

  if (isMobile) {
    return (
      <Grid container direction="row" sx={{ flex: 1, minHeight: 0 }}>
        <Grid sx={{ height: '56.25vw' }}>
          <VideoPlayer video={videos[0]} />
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            overflow: 'auto',
            height: `calc(100vh - 56.25vw - ${HEADER_MOBILE_HEIGHT}px)`,
          }}
        >
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
    <Grid container spacing={2} sx={{ flex: 1, ml: 0, mt: 0, height: 0 }}>
      <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
        <VideoPlayer video={videos[0]} />
      </Grid>

      <Grid
        container
        direction="column"
        item
        xs={12}
        md={4}
        lg={3}
        sx={{
          height: `calc(100vh - ${HEADER_DESKTOP_HEIGHT}px)`,
          overflow: 'auto',
        }}
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
