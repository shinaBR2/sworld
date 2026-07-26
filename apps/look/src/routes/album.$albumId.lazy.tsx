import { createLazyFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { useAuthContext } from 'core/providers/auth';
import { AlbumDetailContainer } from 'ui/look/albums/album-detail';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

// One album's grid lives here as a layout route and stays mounted; the photo
// child route renders the full-screen viewer into <Outlet /> on top of it.
// Because this component never unmounts when a photo opens or closes (only the
// Outlet child swaps between nothing and the viewer), the grid keeps its scroll
// position and the album query is never re-run — opening a photo is instant,
// the album counterpart of the timeline layout.
const AlbumLayout = () => {
  const { albumId } = Route.useParams();
  const { getAccessToken } = useAuthContext();
  const albumResult = useLoadAlbumDetail({ id: albumId, getAccessToken });

  return (
    <Layout collectionValue={albumId}>
      <AlbumDetailContainer
        queryRs={albumResult}
        LinkComponent={Link}
        albumId={albumId}
      />
      <Outlet />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/album/$albumId')({
  component: () => (
    <AuthRoute>
      <AlbumLayout />
    </AuthRoute>
  ),
});
