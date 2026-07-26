import { createLazyFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useLoadPhotos } from 'core/look/query-hooks/photos';
import { useAuthContext } from 'core/providers/auth';
import { PhotoTimelineContainer } from 'ui/look/home-page/container';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

// The timeline grid lives here as a layout route and stays mounted; the photo
// child route renders the full-screen viewer into <Outlet /> on top of it.
// Because this component never unmounts when a photo opens or closes (only the
// Outlet child swaps between nothing and the viewer), the grid keeps its scroll
// position and the photos query is never re-run — opening a photo is instant,
// like Google Photos, instead of rebuilding the whole page.
const TimelineLayout = () => {
  const { getAccessToken } = useAuthContext();
  const photosResult = useLoadPhotos({ getAccessToken });

  return (
    <Layout>
      <PhotoTimelineContainer queryRs={photosResult} LinkComponent={Link} />
      <Outlet />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/_timeline')({
  component: () => (
    <AuthRoute>
      <TimelineLayout />
    </AuthRoute>
  ),
});
