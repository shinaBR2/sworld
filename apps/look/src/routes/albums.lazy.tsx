import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useLoadAlbums } from 'core/look/query-hooks/albums';
import { useAuthContext } from 'core/providers/auth';
import { AlbumListContainer } from 'ui/look/albums/album-list';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const albumsResult = useLoadAlbums({ getAccessToken });

  return (
    <Layout>
      <AlbumListContainer queryRs={albumsResult} LinkComponent={Link} />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/albums')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
