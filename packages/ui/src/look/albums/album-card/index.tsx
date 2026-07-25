import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TransformedAlbum } from 'core/look/query-hooks/types';
import { BlurImage } from '../../photos/blur-image';
import type { LinkComponentType, PhotoLinkProps } from '../../photos/types';
import { formatPhotoCount } from '../utils';

interface AlbumCardProps {
  album: TransformedAlbum;
  LinkComponent?: LinkComponentType;
  linkProps?: PhotoLinkProps;
}

// One album tile: a square cover with the album title and photo count beneath.
// The cover prefers the album's own thumbnail and falls back to its first
// photo; an album with neither shows a plain tinted square. The cover reuses
// BlurImage so albums fade in exactly the way photos do.
const AlbumCard = (props: AlbumCardProps) => {
  const { album, LinkComponent, linkProps } = props;
  const coverSrc = album.thumbnailUrl || album.photos[0]?.thumbnailUrl;
  const count = album.photos.length;

  const card = (
    <Stack sx={{ gap: 1 }}>
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
        {coverSrc ? <BlurImage src={coverSrc} alt={album.title} /> : null}
      </Card>
      <Stack sx={{ px: 0.5 }}>
        <Typography variant="subtitle1" color="text.primary" noWrap>
          {album.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPhotoCount(count)}
        </Typography>
      </Stack>
    </Stack>
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

export { AlbumCard };
