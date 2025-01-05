import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { VideoDetail } from '../components/video-detail';

function VideoDetails() {
  const { videoId } = Route.useParams();

  return <VideoDetail queryRs={{}} LinkComponent={Link} />;
}

export const Route = createLazyFileRoute('/$videoId')({
  component: VideoDetails,
});
