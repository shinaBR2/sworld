import { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import React from 'react';
import { Video } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';
import Box from '@mui/material/Box';

const ReactPlayer = React.lazy(() => import('react-player'));

// TODO handle error
const VideoPlayer = ({ video }: { video: Video }) => {
  const { title, source, thumbnailUrl } = video;

  return (
    <Suspense fallback={<VideoThumbnail title={title} />}>
      <Box
        sx={theme => ({
          aspectRatio: '16/9',
          borderRadius: theme.shape.borderRadius / 12,
          overflow: 'hidden',
          width: '100%',
        })}
      >
        <ReactPlayer
          url={source}
          controls={true}
          width="100%"
          height="100%"
          light={thumbnailUrl ?? defaultThumbnailUrl}
          onError={(error: unknown) => {
            console.error('ReactPlayer Error:', error);
          }}
        />
      </Box>
    </Suspense>
  );
};

export { VideoPlayer };
