import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '../components/layout';
import { LandingGrid } from 'ui/main/home-page/landing-grid';
import { Container } from 'ui/universal/containers/generic';

const landingItems = [
  {
    icon: '🎵',
    title: 'Listen',
    to: '/listen',
  },
  {
    icon: '📺',
    title: 'Watch',
    to: '/watch',
  },
  // {
  //   icon: '📖',
  //   title: 'Read',
  //   to: '/read',
  // },
  // {
  //   icon: '🎮',
  //   title: 'Play',
  //   to: '/play',
  // },
  {
    icon: '💰',
    title: 'Finance',
    to: '/finance',
  },
];

const Content = () => {
  return (
    <Layout>
      <Container maxWidth="xl">
        <LandingGrid items={landingItems} LinkComponent={Link} />
      </Container>
    </Layout>
  );
};

const Index = () => {
  return <Content />;
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
