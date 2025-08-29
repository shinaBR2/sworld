import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { useLoadPosts } from 'core/til/query-hooks/posts';
import React from 'react';
import { HomeContainer } from 'ui/til/home-container';
import { Layout } from '../components/layout';

const Index = () => {
  const queryRs = useLoadPosts();

  return (
    <Layout>
      <HomeContainer queryRs={queryRs} LinkComponent={Link} />
    </Layout>
  );
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
