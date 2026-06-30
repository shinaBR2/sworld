import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MEDIA_TYPES, type MediaType } from 'core/watch/query-hooks';
import {
  formatCreatedDate,
  formatDuration,
  getMediaDisplayName,
} from '../../utils';
import type { PlayableVideo, WithLinkComponent } from '../types';
import { VideoContainer } from '../video-container';
import { VideoThumbnail } from '../video-thumbnail';
import { StyledCard, StyledTitle } from './styled';

// source and duration are NOT in playlist
interface Video extends Omit<PlayableVideo, 'source'> {
  type: MediaType;
  duration?: number;
  source?: string;
  user: {
    username: string;
  };
  progressSeconds?: number;
  createdAt: string;
  // Set when this card is a video watched inside a playlist (e.g. a
  // continue-watching item) so we can show the playlist name + badge.
  playlist?: {
    title: string;
  };
}

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

const PlaylistBadge = () => {
  return (
    <Box
      role="img"
      aria-label="Playlist"
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.75)',
        color: 'common.white',
        borderRadius: 1,
        px: 0.5,
        py: 0.25,
      }}
    >
      <PlaylistPlayIcon sx={{ fontSize: 18 }} />
    </Box>
  );
};

interface DurationBadgeProps {
  duration?: number;
}

const DurationBadge = (props: DurationBadgeProps) => {
  const label = formatDuration(props.duration);
  if (!label) {
    return null;
  }

  return (
    <Box
      aria-label={`Duration ${label}`}
      sx={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        bgcolor: 'rgba(0, 0, 0, 0.75)',
        color: 'common.white',
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {label}
    </Box>
  );
};

interface VideoProgressProps {
  video: Video;
}

const VideoProgress = (props: VideoProgressProps) => {
  const { video } = props;

  const { progressSeconds = 0, duration = 0 } = video;
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
        {(video.type === MEDIA_TYPES.PLAYLIST || Boolean(video.playlist)) && (
          <PlaylistBadge />
        )}
        {video.type !== MEDIA_TYPES.PLAYLIST && (
          <DurationBadge duration={video.duration} />
        )}
        <VideoProgress video={video} />
      </Box>
    );
  }

  if (video.type === MEDIA_TYPES.PLAYLIST) {
    return (
      <Box sx={{ position: 'relative' }}>
        <VideoThumbnail src={video.thumbnailUrl} title={video.title} />
        <PlaylistBadge />
      </Box>
    );
  }

  // Does not show progress when it's the player
  if (video.type === MEDIA_TYPES.VIDEO && 'source' in video) {
    return (
      <VideoContainer
        video={video as PlayableVideo}
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
        title={getMediaDisplayName({
          videoTitle: video.title,
          playlistName: video.playlist?.title,
        })}
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
