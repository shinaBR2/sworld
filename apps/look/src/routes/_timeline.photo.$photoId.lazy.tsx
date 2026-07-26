import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useAuthContext } from 'core/providers/auth';
import { PhotoLightbox } from 'ui/look/photo-detail-page/containers';
import { usePhotoViewer } from '../components/use-photo-viewer';

// The full-screen viewer, rendered into the timeline layout's <Outlet /> on top
// of the still-mounted grid. It reads the same photos list as the grid via the
// shared query hook — React Query returns the cached array with no refetch — so
// the viewer opens instantly and ←/→ steps the whole library without loading.
const Content = () => {
  const { photoId } = Route.useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuthContext();
  const { photos } = useLoadPhotos({ getAccessToken });

  const { isPhotoOpen, onClose } = usePhotoViewer({
    photos,
    activePhotoId: photoId,
    onCloseFallback: () => navigate({ to: '/', replace: true }),
  });

  return (
    <PhotoLightbox
      photos={photos}
      activeId={photoId}
      open={isPhotoOpen}
      onClose={onClose}
      onActiveIdChange={(id) =>
        navigate({
          to: '/photo/$photoId',
          params: { photoId: id },
          replace: true,
        })
      }
    />
  );
};

export const Route = createLazyFileRoute('/_timeline/photo/$photoId')({
  component: Content,
});
