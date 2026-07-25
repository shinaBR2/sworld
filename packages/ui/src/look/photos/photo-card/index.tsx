import Card from '@mui/material/Card';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { BlurImage } from '../blur-image';
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
