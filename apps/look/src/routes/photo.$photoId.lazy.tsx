import { createLazyFileRoute } from '@tanstack/react-router';
import { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useAuthContext } from 'core/providers/auth';
import { PhotoLightbox } from 'ui/look/photo-detail-page/containers';
import { AuthRoute } from 'ui/universal/authRoute';

// The lightbox steps ←/→ through the whole timeline in memory, so the route
// loads the same photo list as the home page (a React Query cache hit when the
// user opened it from there) rather than fetching one photo. The URL's photoId
// is the active photo; closing returns to the timeline, and stepping replaces
// the URL so the back button leaves the lightbox instead of walking every photo.
const Content = () => {
  const { photoId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { getAccessToken } = useAuthContext();
  const { photos } = useLoadPhotos({ getAccessToken });

  return (
    <PhotoLightbox
      photos={photos}
      activeId={photoId}
      open
      onClose={() => navigate({ to: '/' })}
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

export const Route = createLazyFileRoute('/photo/$photoId')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
