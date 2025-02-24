import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent } from '../../videos/types';
import { VideoListItem } from '../../videos/list-item';
import { generateVideoDetailRoute } from 'core/watch/routes';
import { TransformedVideo } from 'core/watch/query-hooks';

interface RelatedListProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  videos: TransformedVideo[];
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
              linkProps={generateVideoDetailRoute(video)}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export { RelatedList };
