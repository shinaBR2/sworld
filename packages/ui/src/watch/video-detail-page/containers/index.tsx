import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useIsMobile } from '../../../universal/responsive';
import { RelatedList } from '../related-list';
import { VideoDetailContainerProps } from '../../videos/interface';
import { VideoPlayer } from '../../videos/video-player';

const VideoDetailContainer = (props: VideoDetailContainerProps) => {
  const { queryRs, LinkComponent } = props;
  const { videos, isLoading } = queryRs;
  const isMobile = useIsMobile();

  if (isLoading) {
    return 'is Loading';
  }

  if (isMobile) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sticky video section with 16:9 aspect ratio */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            width: '100%',
            bgcolor: 'background.paper',
            zIndex: 1,
            // Parent container for maintaining aspect ratio
            '&::before': {
              content: '""',
              display: 'block',
              paddingTop: '56.25%', // 16:9 Aspect Ratio
            },
            // Container for actual content
            '& > *': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            },
          }}
        >
          <VideoPlayer video={videos[0]} />
        </Box>

        {/* Scrollable list section */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            px: 2,
          }}
        >
          <RelatedList
            videos={videos}
            title="other videos"
            LinkComponent={LinkComponent}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 400px', // Adjust the 400px as needed
        gap: 2,
        px: { xs: 2, sm: 3 },
        py: 2,
      }}
    >
      {/* Main video section */}
      <Box sx={{ width: '100%', height: '100%' }}>
        <VideoPlayer video={videos[0]} />
      </Box>

      {/* Right sidebar */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <RelatedList
          videos={videos}
          title="other videos"
          LinkComponent={LinkComponent}
        />
      </Box>
    </Container>
  );
};

export { VideoDetailContainer };
