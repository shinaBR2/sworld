import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { TimelinePage } from '../components/timeline-page';

export const Route = createLazyFileRoute('/')({
  component: () => {
    return (
      <AuthRoute>
        <TimelinePage />
      </AuthRoute>
    );
  },
});
