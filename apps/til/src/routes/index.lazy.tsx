import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadPosts } from 'core/til/query-hooks/posts';
import { HomeContainer } from 'ui/til/home-container';
import { WriteFab } from 'ui/til/write-fab';
import { Layout } from '../components/layout';

const Index = () => {
  const queryRs = useLoadPosts();
  const { isSignedIn } = Auth.useAuthContext();

  return (
    <Layout>
      <HomeContainer queryRs={queryRs} LinkComponent={Link} />
      {isSignedIn && <WriteFab LinkComponent={Link} />}
    </Layout>
  );
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
