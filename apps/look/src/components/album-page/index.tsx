import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { useAuthContext } from 'core/providers/auth';
import { AlbumDetailContainer } from 'ui/look/albums/album-detail';
import { PhotoLightbox } from 'ui/look/photo-detail-page/containers';
import { Layout } from '../layout';

interface AlbumPageProps {
  albumId: string;
  activePhotoId?: string;
}

// One album as a grid + full-screen viewer — the album counterpart of
// TimelinePage. The URL decides whether a photo is open, but scoped to this
// album: the viewer steps ←/→ through the album's photos (not the whole
// library) and an unknown id leaves the viewer closed on the grid. Stepping
// replaces the URL so Back leaves the viewer in one step. Closing goes back in
// history so it returns to wherever the photo was opened from, falling back to
// the album grid when there's no in-app history (a photo URL opened directly or
// reloaded).
const AlbumPage = (props: AlbumPageProps) => {
  const { albumId, activePhotoId } = props;
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { getAccessToken } = useAuthContext();
  const albumResult = useLoadAlbumDetail({ id: albumId, getAccessToken });
  const photos = albumResult.album?.photos ?? [];
  const isPhotoOpen =
    activePhotoId !== undefined &&
    photos.some((photo) => photo.id === activePhotoId);

  return (
    <Layout collectionValue={albumId}>
      <AlbumDetailContainer
        queryRs={albumResult}
        LinkComponent={Link}
        albumId={albumId}
      />
      <PhotoLightbox
        photos={photos}
        activeId={activePhotoId ?? ''}
        open={isPhotoOpen}
        onClose={() =>
          canGoBack
            ? router.history.back()
            : navigate({
                to: '/album/$albumId',
                params: { albumId },
                replace: true,
              })
        }
        onActiveIdChange={(id) =>
          navigate({
            to: '/album/$albumId/photo/$photoId',
            params: { albumId, photoId: id },
            replace: true,
          })
        }
      />
    </Layout>
  );
};

export { AlbumPage };
