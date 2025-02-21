import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent, VideoItem } from '../../videos/interface';
import { VideoListItem } from '../../videos/list-item';

interface RelatedListProps extends RequiredLinkComponent {
  videos: VideoItem[];
  title?: string;
  activeId?: string;
}

const RelatedList = ({ videos, title = 'Related videos', activeId, LinkComponent }: RelatedListProps) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          px: 2,
          mb: 2,
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={2}>
        {videos.map(video => (
          <Box key={video.id} sx={{ px: 2 }}>
            <VideoListItem
              key={video.id}
              video={video}
              isActive={activeId === video.id}
              LinkComponent={LinkComponent}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export { RelatedList };
