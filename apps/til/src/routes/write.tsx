import { createFileRoute } from '@tanstack/react-router';
import { AuthRoute } from 'ui/universal/authRoute';
import { Layout } from '../components/layout';

export const Route = createFileRoute('/write')({
  component: WritePage,
});

function WritePage() {
  return (
    <AuthRoute>
      <Layout>
        <div style={{ padding: '2rem' }}>
          <h1>Create a New TIL</h1>
          <p>
            This page is only accessible for authenticated users.
            Coming soon...
          </p>
        </div>
      </Layout>
    </AuthRoute>
  );
}
