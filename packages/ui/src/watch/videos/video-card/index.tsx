import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Suspense } from 'react';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { Video, WithLinkComponent } from '../interface';
import { VideoPlayer } from '../video-player';
import { VideoThumbnail } from '../video-thumbnail';

const ReactPlayer = React.lazy(() => import('react-player'));

interface ContentProps {
  video: Video;
  asLink?: boolean;
}

interface VideoCardProps extends ContentProps, WithLinkComponent {}

const Content = (props: ContentProps) => {
  const { video, asLink } = props;
  const { title, thumbnailUrl, duration, createdAt, user } = video;
  const createdTime = new Date(createdAt).toISOString().split('T')[0];
  const { username: creator } = user;

  return (
    <Card
      sx={{
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
      }}
    >
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        {asLink ? (
          <VideoPlayer video={video} />
        ) : (
          <VideoThumbnail src={thumbnailUrl} title={title} />
        )}

        {duration && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>
      <CardContent sx={{ p: 1.5, pt: 2, '&:last-child': { pb: 1 } }}>
        <Typography
          gutterBottom
          variant="body1"
          component="h3"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 0.5,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {creator} • {createdTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

const VideoCard = (props: VideoCardProps) => {
  const { video, asLink, LinkComponent } = props;
  const { id, title, source, thumbnailUrl, duration, createdAt, user } = video;
  const createdTime = new Date(createdAt).toISOString().split('T')[0];
  const { username: creator } = user;

  if (asLink && LinkComponent) {
    return (
      <LinkComponent
        to="/$videoId"
        params={{ videoId: id }}
        style={{ textDecoration: 'none' }}
      >
        <Content video={video} />
      </LinkComponent>
    );
  }

  return (
    <Card
      sx={{
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
      }}
    >
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <Suspense
          fallback={
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
          }
        >
          <ReactPlayer
            url={source}
            controls={true}
            width="100%"
            height="100%"
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#e0e0e0',
            }}
            light={thumbnailUrl ?? defaultThumbnailUrl}
            onError={(error: unknown) => {
              console.error('ReactPlayer Error:', error);
            }}
          />
        </Suspense>

        {duration && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>
      <CardContent sx={{ p: 1.5, pt: 2, '&:last-child': { pb: 1 } }}>
        <Typography
          gutterBottom
          variant="body1"
          component="h3"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 0.5,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {creator} • {createdTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export { VideoCard };
