import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { PairPage } from '../components/PairPage';

const PairRoute = () => {
  return (
    <AuthRoute>
      <PairPage />
    </AuthRoute>
  );
};

export const Route = createLazyFileRoute('/pair')({
  component: PairRoute,
});
