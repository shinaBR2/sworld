import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { VideoDetail } from '../components/video-detail';
import { Auth, watchQueryHooks } from 'core';

function VideoDetails() {
  const { videoId } = Route.useParams();
  const authContext = Auth.useAuthContext();
  const videoResult = watchQueryHooks.useLoadVideos({
    getAccessToken: authContext.getAccessToken,
  });

  console.log(`videoId`, videoId);

  return <VideoDetail queryRs={videoResult} LinkComponent={Link} />;
}

export const Route = createLazyFileRoute('/$videoId')({
  component: VideoDetails,
});
