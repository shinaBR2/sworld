import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { WithLinkComponent } from '../types';
import { VideoThumbnail } from '../video-thumbnail';
import { StyledCard, StyledTitle } from './styled';
import { formatCreatedDate } from '../../utils';
import { VideoContainer } from '../video-container';
import { MEDIA_TYPES } from 'core/watch/query-hooks';
import { TransformedMediaItem, TransformedVideo } from 'core/watch/query-hooks';

interface VideoCardProps extends WithLinkComponent {
  video: TransformedMediaItem;
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

interface VideoProgressProps {
  video: TransformedMediaItem;
}

const VideoProgress = (props: VideoProgressProps) => {
  const { video } = props;
  if (video.type == MEDIA_TYPES.PLAYLIST) {
    return null;
  }

  const { progressSeconds = 0, duration = 0 } = video as TransformedVideo;
  if (progressSeconds > 0 && duration > 0) {
    return (
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
    );
  }

  return null;
};

interface VideoContentProps extends VideoCardProps {}

const VideoContent = (props: VideoContentProps) => {
  const { video, asLink } = props;

  if (asLink) {
    return (
      <Box sx={{ position: 'relative' }}>
        <VideoThumbnail src={video.thumbnailUrl} title={video.title} />
        <VideoProgress video={video} />
      </Box>
    );
  }

  if (video.type == MEDIA_TYPES.PLAYLIST) {
    return (
      <Box sx={{ position: 'relative' }}>
        <VideoThumbnail src={video.thumbnailUrl} title={video.title} />
      </Box>
    );
  }

  // Does not show progress when it's the player
  if (video.type === MEDIA_TYPES.VIDEO && 'source' in video) {
    return (
      <VideoContainer
        video={video}
        onError={(err: unknown) => {
          console.log(err);
        }}
      />
    );
  }

  return null;
};

const VideoCard = (props: VideoCardProps) => {
  const { video, asLink, LinkComponent, linkProps } = props;

  const cardContent = (
    <StyledCard>
      <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
        <VideoContent video={video} asLink={asLink} />
      </Box>
      <VideoCardContent
        title={video.title}
        creator={video.user?.username || ''}
        createdTime={formatCreatedDate(video.createdAt)}
      />
    </StyledCard>
  );

  if (asLink && LinkComponent && linkProps) {
    return (
      <LinkComponent {...linkProps} style={{ textDecoration: 'none' }}>
        {cardContent}
      </LinkComponent>
    );
  }

  return cardContent;
};

export { VideoCard };
