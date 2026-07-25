import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { TimelinePage } from '../components/timeline-page';

const Content = () => {
  const { photoId } = Route.useParams();

  return <TimelinePage activePhotoId={photoId} />;
};

export const Route = createLazyFileRoute('/photo/$photoId')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
