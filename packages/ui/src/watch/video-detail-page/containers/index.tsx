import Grid from '@mui/material/Grid';
import { useIsMobile } from '../../../universal/responsive';
import { LoadingSkeleton } from './skeleton';
import { VideoDetailContainerProps } from './types';
import Box from '@mui/material/Box';
import { VideoContainer } from '../../videos/video-container';
import Typography from '@mui/material/Typography';
import { RelatedList } from '../related-list';

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const isMobile = useIsMobile();
  const { queryRs, activeVideoId, LinkComponent } = props;
  const { videos, playlist, isLoading } = queryRs;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const videoDetail = queryRs.videos.find(video => video.id === activeVideoId);

  if (!videoDetail) {
    // TODO: handle error
    return null;
  }

  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      <Grid container item alignItems="center" xs={12} sm={6} md={8} lg={9}>
        <Grid item sx={{ width: '100%', px: 2 }}>
          <VideoContainer
            video={videoDetail}
            onError={(err: unknown) => {
              console.log(err);
            }}
          />
          <Typography
            component="h1"
            variant="h4"
            sx={{
              my: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {videoDetail.title}
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="column" item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ overflowY: 'auto', height: isMobile ? 'calc(100vh - 56.25vw - 180px)' : 'calc(100vh - 128px)' }}>
          <RelatedList
            videos={videos}
            playlist={playlist}
            title={playlist ? 'Same playlist' : 'Other videos'}
            activeId={videoDetail.id}
            LinkComponent={LinkComponent}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export { VideoDetailContainer };
