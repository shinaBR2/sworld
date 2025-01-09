import { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import React from 'react';
import { Video } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';

const ReactPlayer = React.lazy(() => import('react-player'));

// TODO handle error
const VideoPlayer = ({ video }: { video: Video }) => {
  const { title, source, thumbnailUrl } = video;

  return (
    <Suspense fallback={<VideoThumbnail title={title} />}>
      <ReactPlayer
        url={source}
        controls={true}
        width="100%"
        height="100%"
        style={{
          aspectRatio: '16/9',
        }}
        light={thumbnailUrl ?? defaultThumbnailUrl}
        onError={(error: unknown) => {
          console.error('ReactPlayer Error:', error);
        }}
      />
    </Suspense>
  );
};

export { VideoPlayer };
