import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useLoadAlbumDetail } from 'core/look/query-hooks/albums';
import { useAuthContext } from 'core/providers/auth';
import { AlbumDetailContainer } from 'ui/look/albums/album-detail';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

const Content = () => {
  const { albumId } = Route.useParams();
  const { getAccessToken } = useAuthContext();
  const albumResult = useLoadAlbumDetail({ id: albumId, getAccessToken });

  return (
    <Layout collectionValue={albumId}>
      <AlbumDetailContainer queryRs={albumResult} LinkComponent={Link} />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/album/$albumId')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
