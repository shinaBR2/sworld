import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '../components/layout';
import { HomeContainer } from 'ui/til/home-container';
import { useLoadPosts } from 'core/til/query-hooks/posts';

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
