import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { useAuthContext } from 'core/providers/auth';
import { PhotoLightbox } from 'ui/look/photo-detail-page/containers';
import { usePhotoViewer } from '../components/use-photo-viewer';

// The full-screen viewer, rendered into the album layout's <Outlet /> on top of
// the still-mounted album grid. It reads the same album photos as the grid via
// the shared query hook — React Query returns the cached list with no refetch —
// so the viewer opens instantly and ←/→ steps only this album's photos.
const Content = () => {
  const { albumId, photoId } = Route.useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuthContext();
  const albumResult = useLoadAlbumDetail({ id: albumId, getAccessToken });
  const photos = albumResult.album?.photos ?? [];

  const { isPhotoOpen, onClose } = usePhotoViewer({
    photos,
    activePhotoId: photoId,
    onCloseFallback: () =>
      navigate({ to: '/album/$albumId', params: { albumId }, replace: true }),
  });

  return (
    <PhotoLightbox
      photos={photos}
      activeId={photoId}
      open={isPhotoOpen}
      onClose={onClose}
      onActiveIdChange={(id) =>
        navigate({
          to: '/album/$albumId/photo/$photoId',
          params: { albumId, photoId: id },
          replace: true,
        })
      }
    />
  );
};

export const Route = createLazyFileRoute('/album/$albumId/photo/$photoId')({
  component: Content,
});
