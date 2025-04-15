import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '../components/layout';
import { LandingGrid } from 'ui/main/home-page/landing-grid';
import { Container } from 'ui/universal/containers/generic';
import { appConfig } from '../config';

const landingItems = [
  {
    icon: '🎵',
    title: 'Listen',
    to: appConfig.sites.listen,
    isExternal: true,
  },
  {
    icon: '📺',
    title: 'Watch',
    to: appConfig.sites.watch,
    isExternal: true,
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
    isExternal: false,
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
