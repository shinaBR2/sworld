import { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import React from 'react';
import { Video } from '../interface';
import { VideoThumnail } from '../video-thumbnail';

const ReactPlayer = React.lazy(() => import('react-player'));

const VideoPlayer = ({ video }: { video: Video }) => {
  const { title, source, thumbnail } = video;
  return (
    <Suspense fallback={<VideoThumnail title={title} />}>
      <ReactPlayer
        url={source}
        controls={true}
        width="100%"
        height="100%"
        style={{
          aspectRatio: '16/9',
          backgroundColor: '#e0e0e0',
        }}
        light={thumbnail ?? defaultThumbnailUrl}
        onError={(error: unknown) => {
          console.error('ReactPlayer Error:', error);
        }}
      />
    </Suspense>
  );
};

export { VideoPlayer };
