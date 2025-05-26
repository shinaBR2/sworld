import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { RequiredLinkComponent } from '../../videos/types';
import { VideoListItem } from '../../videos/list-item';
import { generateVideoDetailRoute, generateVideoInPlaylistRoute } from 'core/watch/routes';
import { TransformedVideo, useLoadPlaylistDetail } from 'core/watch/query-hooks';
import React from 'react';

interface RelatedListProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  autoPlay?: boolean;
  onAutoPlayChange?: (checked: boolean) => void;
  videos: TransformedVideo[];
  title?: string;
  activeId?: string;
  playlist?: ReturnType<typeof useLoadPlaylistDetail>['playlist'] | null;
}

const genLinkProps = (
  playlist: ReturnType<typeof useLoadPlaylistDetail>['playlist'] | null,
  video: TransformedVideo
) => {
  if (playlist) {
    return generateVideoInPlaylistRoute({
      playlistId: playlist.id,
      videoId: video.id,
      playlistSlug: playlist.slug,
    });
  }

  return generateVideoDetailRoute({
    id: video.id,
    slug: video.slug,
  });
};

const RelatedList = React.memo((props: RelatedListProps) => {
  const { videos, title = 'Related videos', activeId, playlist, LinkComponent, autoPlay, onAutoPlayChange } = props;

  return (
    <Box>
      {onAutoPlayChange && (
        <Box sx={{ px: 2, mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={autoPlay} onChange={(e) => onAutoPlayChange(e.target.checked)} />}
            label="Auto-play next video"
          />
        </Box>
      )}
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
              linkProps={genLinkProps(playlist, video)}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
});

export { RelatedList };
