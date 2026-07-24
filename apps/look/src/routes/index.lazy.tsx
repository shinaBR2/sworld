import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

const Content = () => {
  return (
    <Layout>
      <h1>Look</h1>
    </Layout>
  );
};

export const Route = createLazyFileRoute('/')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
