import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '../components/layout';
import { LandingGrid } from 'ui/main/home-page/landing-grid';

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
  {
    icon: '📖',
    title: 'Read',
    to: '/read',
  },
  {
    icon: '🎮',
    title: 'Play',
    to: '/play',
  },
];

const Content = () => {
  return (
    <Layout>
      <LandingGrid items={landingItems} LinkComponent={Link} />
    </Layout>
  );
};

const Index = () => {
  return <Content />;
};

export const Route = createLazyFileRoute('/')({
  component: Index,
});
