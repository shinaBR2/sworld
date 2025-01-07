import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React, { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { Video, WithLinkComponent } from '../interface';
import { VideoThumbnail } from '../video-thumbnail';

const ReactPlayer = React.lazy(() => import('react-player'));

interface VideoCardProps extends WithLinkComponent {
  video: Video;
  asLink?: boolean;
}

// Shared styles as constants
const cardStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'none',
  bgcolor: 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    cursor: 'pointer',
  },
} as const;

const durationBadgeStyles = {
  position: 'absolute',
  bottom: 8,
  right: 8,
  bgcolor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  px: 1,
  py: 0.5,
  borderRadius: 1,
  fontWeight: 500,
} as const;

const titleStyles = {
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  mb: 0.5,
  lineHeight: 1.3,
} as const;

// Helper components
const DurationBadge = ({ duration }: { duration?: string }) => {
  if (!duration) return null;

  return (
    <Typography variant="caption" sx={durationBadgeStyles}>
      {duration}
    </Typography>
  );
};

interface VideoCardContentProps {
  title: string;
  creator: string;
  createdTime: string;
}

const VideoCardContent = (props: VideoCardContentProps) => {
  const { title, creator, createdTime } = props;

  return (
    <CardContent sx={{ p: 1.5, pt: 2, '&:last-child': { pb: 1 } }}>
      <Typography gutterBottom variant="body1" component="h3" sx={titleStyles}>
        {title}
      </Typography>
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

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      {asLink ? (
        <VideoThumbnail src={video.thumbnailUrl} title={video.title} />
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
      <DurationBadge duration={video.duration} />
    </Box>
  );
};

const VideoCard = ({ video, asLink, LinkComponent }: VideoCardProps) => {
  const createdTime = new Date(video.createdAt).toISOString().split('T')[0];

  const cardContent = (
    <Card sx={cardStyles}>
      <VideoContent video={video} asLink={asLink} />
      <VideoCardContent
        title={video.title}
        creator={video.user.username}
        createdTime={createdTime}
      />
    </Card>
  );

  if (asLink && LinkComponent) {
    return (
      <LinkComponent
        to="/$videoId"
        params={{ videoId: video.id }}
        style={{ textDecoration: 'none' }}
      >
        {cardContent}
      </LinkComponent>
    );
  }

  return cardContent;
};

export { VideoCard };
