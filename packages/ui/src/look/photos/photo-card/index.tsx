import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { BlurImage } from '../blur-image';
import { formatDuration } from '../format-duration';
import type { LinkComponentType, PhotoLinkProps } from '../types';

interface PhotoCardProps {
  photo: TransformedPhoto;
  LinkComponent?: LinkComponentType;
  linkProps?: PhotoLinkProps;
}

// One square tile in the timeline grid. Fixed aspect ratio + overflow hidden
// gives the grid uniform, shift-free rows; the image is layered inside.
const PhotoCard = (props: PhotoCardProps) => {
  const { photo, LinkComponent, linkProps } = props;

  const isVideo = photo.type === 'video';
  const durationLabel = formatDuration(photo.duration);

  const card = (
    <Card
      sx={{
        position: 'relative',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        boxShadow: 'none',
        borderRadius: 1,
        bgcolor: 'action.hover',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <BlurImage
        src={photo.thumbnailUrl}
        alt={photo.slug ?? 'Photo'}
        blurHash={photo.blurHash}
      />
      {isVideo ? (
        <>
          {/* Centered play glyph so a video reads as playable at a glance in the
              grid. Pinned white on a translucent-black disc so it stays legible
              over any thumbnail, in both themes. */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: '50%',
              color: 'common.white',
              bgcolor: 'rgba(0, 0, 0, 0.55)',
              pointerEvents: 'none',
            }}
          >
            <PlayArrowRoundedIcon />
          </Box>
          {durationLabel ? (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'rgba(0, 0, 0, 0.75)',
                color: 'common.white',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.4,
                pointerEvents: 'none',
              }}
            >
              {durationLabel}
            </Box>
          ) : null}
        </>
      ) : null}
    </Card>
  );

  if (!LinkComponent || !linkProps) {
    return card;
  }

  return (
    <LinkComponent
      to={linkProps.to}
      params={linkProps.params}
      style={{ textDecoration: 'none' }}
    >
      {card}
    </LinkComponent>
  );
};

export { PhotoCard };
