import { Link, useNavigate } from '@tanstack/react-router';
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
const TimelinePage = (props: TimelinePageProps) => {
  const { activePhotoId } = props;
  const navigate = useNavigate();
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
        onClose={() => navigate({ to: '/' })}
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
