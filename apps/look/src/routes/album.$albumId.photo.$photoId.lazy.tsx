import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { AlbumPage } from '../components/album-page';

const Content = () => {
  const { albumId, photoId } = Route.useParams();

  return <AlbumPage albumId={albumId} activePhotoId={photoId} />;
};

export const Route = createLazyFileRoute('/album/$albumId/photo/$photoId')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
