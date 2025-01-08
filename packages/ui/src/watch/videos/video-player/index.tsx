import { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import React from 'react';
import { Video } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';
import { useIsMobile } from '../../../universal/responsive';

const ReactPlayer = React.lazy(() => import('react-player'));

// TODO handle error
const VideoPlayer = ({ video }: { video: Video }) => {
  const { title, source, thumbnailUrl } = video;
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<VideoThumbnail title={title} />}>
      <ReactPlayer
        url={source}
        controls={true}
        width="100%"
        height={isMobile ? '100%' : 'auto'}
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
