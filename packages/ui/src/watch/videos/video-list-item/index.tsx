import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RequiredLinkComponent, Video } from '../interface';
import PlayCircle from '@mui/icons-material/PlayCircle';
import { ResponsiveImage } from '../../../universal/images/image';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { CSSProperties } from 'react';

interface ThumbnailProps {
  src?: string;
  title: string;
}

interface VideoListItemProps extends RequiredLinkComponent {
  video: Video;
}

const thumbnailImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

const Thumbnail = (props: ThumbnailProps) => {
  const { src, title } = props;

  if (!src) {
    return (
      <Box
        component="img"
        src={defaultThumbnailUrl}
        alt={title}
        sx={thumbnailImgStyle}
      />
    );
  }

  return (
    <ResponsiveImage
      sizes="(max-width: 768px) 64px, (max-width: 1200px) 64px"
      widths={[64, 128, 192]}
      src={src}
      alt={title}
      imgProps={{
        style: thumbnailImgStyle,
      }}
    />
  );
};

const VideoListItem = (props: VideoListItemProps) => {
  const { video, LinkComponent } = props;
  const { id, title, thumbnail, duration, user } = video;

  return (
    <LinkComponent
      to="/$videoId"
      params={{ videoId: id }}
      style={{ textDecoration: 'none' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 1,
          '&:hover': {
            bgcolor: 'action.hover',
            '& .play-icon': {
              opacity: 1,
            },
          },
        }}
      >
        {/* Thumbnail with play overlay */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          >
            <Thumbnail src={thumbnail} title={title} />
          </Box>
          <Box
            className="play-icon"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              opacity: 0,
              transition: 'opacity 0.2s',
              borderRadius: 1,
            }}
          >
            <PlayCircle fontSize={'medium'} />
          </Box>
          {duration && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                px: 0.5,
                borderRadius: 0.5,
                fontSize: '0.75rem',
              }}
            >
              {duration}
            </Typography>
          )}
        </Box>

        {/* Text content */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.username}
          </Typography>
        </Box>
      </Box>
    </LinkComponent>
  );
};

export { VideoListItem };
