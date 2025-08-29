import { createLazyFileRoute, Link } from '@tanstack/react-router';
import React from 'react';
import { LandingGrid } from 'ui/main/home-page/landing-grid';
import { Container } from 'ui/universal/containers/generic';
import { Layout } from '../components/layout';
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
  {
    icon: '📖',
    title: 'Library',
    to: '/library',
    isExternal: false,
  },
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
  {
    icon: '📝',
    title: 'Journal',
    to: '/journal',
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
