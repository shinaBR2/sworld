import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useAuthContext } from 'core/providers/auth';
import { PhotoTimelineContainer } from 'ui/look/home-page/container';
import { PhotoLightbox } from 'ui/look/photo-detail-page/containers';
import { Layout } from '../layout';

interface TimelinePageProps {
  activePhotoId?: string;
}

// The timeline and the full-screen lightbox are one view: the URL decides
// whether a photo is open. The lightbox steps ←/→ through the same in-memory
// list the grid shows, so opening a photo never refetches. An unknown id (bad
// link, deleted photo, load error → empty list) leaves the lightbox closed and
// the user on the grid rather than a blank screen. Stepping replaces the URL so
// Back leaves the lightbox in one step instead of walking every photo visited.
//
// Closing goes back in history so it returns to wherever the photo was opened
// from — the timeline, or the album grid when opened from an album — instead of
// always jumping home. When there's no in-app history to return to (a photo URL
// opened directly, or reloaded), it falls back to the home route.
const TimelinePage = (props: TimelinePageProps) => {
  const { activePhotoId } = props;
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { getAccessToken } = useAuthContext();
  const photosResult = useLoadPhotos({ getAccessToken });
  const { photos } = photosResult;
  const isPhotoOpen =
    activePhotoId !== undefined &&
    photos.some((photo) => photo.id === activePhotoId);

  return (
    <Layout>
      <PhotoTimelineContainer queryRs={photosResult} LinkComponent={Link} />
      <PhotoLightbox
        photos={photos}
        activeId={activePhotoId ?? ''}
        open={isPhotoOpen}
        onClose={() =>
          canGoBack
            ? router.history.back()
            : navigate({ to: '/', replace: true })
        }
        onActiveIdChange={(id) =>
          navigate({
            to: '/photo/$photoId',
            params: { photoId: id },
            replace: true,
          })
        }
      />
    </Layout>
  );
};

export { TimelinePage };
