import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Auth, watchQueryHooks } from 'core';
import { VideoDetailContainer } from 'ui/watch/video-detail-page/containers';
import { Layout } from '../components/layout';

function VideoDetails() {
  const { videoId } = Route.useParams();
  const authContext = Auth.useAuthContext();
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken: authContext.getAccessToken,
  });

  console.log(`videoIr`, videoId);

  return (
    <Layout>
      <VideoDetailContainer queryRs={videoResult} LinkComponent={Link} />
    </Layout>
  );
}

export const Route = createLazyFileRoute('/$videoId')({
  component: VideoDetails,
});