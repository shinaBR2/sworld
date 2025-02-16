import Box from '@mui/material/Box';
import { RequiredLinkComponent, Video } from '../interface';
import PlayCircle from '@mui/icons-material/PlayCircle';
import { ResponsiveImage } from '../../../universal/images/image';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';
import {
  ListItemContainer,
  PlayIconOverlay,
  Progress,
  ProgressBar,
  ThumbnailContainer,
  thumbnailImgStyle,
  ThumbnailWrapper,
  TitleText,
  UsernameText,
} from './styled';

interface ThumbnailProps {
  src?: string;
  title: string;
}

interface VideoListItemProps extends RequiredLinkComponent {
  video: Video;
  isActive?: boolean;
}

const Thumbnail = (props: ThumbnailProps) => {
  const { src, title } = props;

  if (!src) {
    return <Box component="img" src={defaultThumbnailUrl} alt={title} sx={thumbnailImgStyle} />;
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
  const { video, isActive = false, LinkComponent } = props;
  const { id, title, thumbnailUrl, duration = 0, user, progressSeconds = 0 } = video;

  return (
    <LinkComponent to="/$videoId" params={{ videoId: id }} style={{ textDecoration: 'none' }}>
      <ListItemContainer isActive={isActive} aria-current={isActive ? 'page' : undefined}>
        {/* Thumbnail with play overlay */}
        <ThumbnailContainer>
          <ThumbnailWrapper>
            <Thumbnail src={thumbnailUrl} title={title} />
            {progressSeconds > 0 && duration > 0 && (
              <ProgressBar
                role="progressbar"
                aria-label="Video progress"
                aria-valuenow={(progressSeconds / duration) * 100} // Calculate actual percentage
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <Progress
                  sx={{
                    width: `${(progressSeconds / duration) * 100}%`,
                    bgcolor: 'error.main',
                  }}
                />
              </ProgressBar>
            )}
          </ThumbnailWrapper>
          <PlayIconOverlay className="play-icon">
            <PlayCircle fontSize={'medium'} />
          </PlayIconOverlay>
        </ThumbnailContainer>

        {/* Text content */}
        <Box sx={{ minWidth: 0 }}>
          <TitleText
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
          </TitleText>
          <UsernameText
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
          </UsernameText>
        </Box>
      </ListItemContainer>
    </LinkComponent>
  );
};

export { VideoListItem };
