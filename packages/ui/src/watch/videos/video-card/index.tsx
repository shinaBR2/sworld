import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React, { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { Video, WithLinkComponent } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';
import { StyledCard, StyledTitle } from './styled';
import { formatCreatedDate } from '../../utils';

const ReactPlayer = React.lazy(() => import('react-player'));

interface VideoCardProps extends WithLinkComponent {
  video: Video;
  asLink?: boolean;
}

interface VideoCardContentProps {
  title: string;
  creator: string;
  createdTime: string;
}

const VideoCardContent = (props: VideoCardContentProps) => {
  const { title, creator, createdTime } = props;

  return (
    <CardContent sx={{ px: 0, pt: 2, '&:last-child': { pb: 1 } }}>
      <StyledTitle gutterBottom variant="body1" component="h3">
        {title}
      </StyledTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {creator} • {createdTime}
      </Typography>
    </CardContent>
  );
};

const VideoPlayerFallback = ({ title }: { title: string }) => (
  <CardMedia
    component="img"
    image={defaultThumbnailUrl}
    alt={title}
    sx={{
      aspectRatio: '16/9',
      objectFit: 'cover',
      bgcolor: '#e0e0e0',
    }}
  />
);

interface VideoContentProps {
  video: Video;
  asLink?: boolean;
}

const VideoContent = (props: VideoContentProps) => {
  const { video, asLink } = props;
  const { progressSeconds = 0, duration = 0 } = video;

  return (
    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      {asLink ? (
        <Box sx={{ position: 'relative' }}>
          <VideoThumbnail src={video.thumbnailUrl} title={video.title} />
          {progressSeconds > 0 && duration > 0 && (
            <Box
              role="progressbar"
              aria-label="Video progress"
              aria-valuenow={(progressSeconds / duration) * 100} // Calculate actual percentage
              aria-valuemin={0}
              aria-valuemax={100}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box
                sx={{
                  width: `${(progressSeconds / duration) * 100}%`,
                  height: '100%',
                  bgcolor: 'error.main',
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Suspense fallback={<VideoPlayerFallback title={video.title} />}>
          <ReactPlayer
            url={video.source}
            controls={true}
            width="100%"
            height="100%"
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#e0e0e0',
            }}
            light={video.thumbnailUrl ?? defaultThumbnailUrl}
            onError={(error: unknown) => {
              console.error('ReactPlayer Error:', error);
            }}
          />
        </Suspense>
      )}
    </Box>
  );
};

const VideoCard = ({ video, asLink, LinkComponent }: VideoCardProps) => {
  const cardContent = (
    <StyledCard>
      <VideoContent video={video} asLink={asLink} />
      <VideoCardContent
        title={video.title}
        creator={video.user.username}
        createdTime={formatCreatedDate(video.createdAt)}
      />
    </StyledCard>
  );

  if (asLink && LinkComponent) {
    return (
      <LinkComponent to="/$videoId" params={{ videoId: video.id }} style={{ textDecoration: 'none' }}>
        {cardContent}
      </LinkComponent>
    );
  }

  return cardContent;
};

export { VideoCard };
