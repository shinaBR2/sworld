import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

import { Grid, Paper, Typography, Box } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AppsIcon from '@mui/icons-material/Apps';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

// Tech stack items with descriptions and links
const techStack = [
  {
    title: 'Hasura GraphQL',
    icon: <StorageIcon fontSize="large" />,
    description:
      'Instant GraphQL API for rapid development and real-time data access',
    link: '/blog/tags/hasura',
  },
  {
    title: 'Firebase',
    icon: <CloudIcon fontSize="large" />,
    description:
      'Scalable backend infrastructure for hosting, storage, and real-time features',
    link: '/blog/tags/firebase',
  },
  {
    title: 'Auth0',
    icon: <SecurityIcon fontSize="large" />,
    description: 'Enterprise-grade authentication and authorization',
    link: '/blog/tags/auth-0',
  },
  {
    title: 'Serverless',
    icon: <CloudIcon fontSize="large" />,
    description: 'Event-driven architecture with automatic scaling',
    link: '/blog/tags/serverless',
  },
  {
    title: 'PNPM',
    icon: <AppsIcon fontSize="large" />,
    description:
      'Fast, disk space efficient package manager with built-in monorepo support',
    // Since there's no PNPM tag yet, we'll point to the docs section
    link: '/blog/tags/pnpm', // You can adjust this path as needed
  },
  {
    title: 'Monorepo',
    icon: <ArchitectureIcon fontSize="large" />,
    description:
      'High-performance monorepo management for optimal development workflow',
    link: '/blog/tags/monorepo',
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* Logo can be added here */}
        {/* <div className={styles.logo}>
          <img
            src="https://res.cloudinary.com/shinabr2/image/upload/v1670251329/Public/Images/sworld-logo-72x72.png"
            alt={siteConfig.title}
          />
        </div> */}
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          Building Modern Web Applications with Enterprise-Grade Architecture
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/blog">
            Explore My Journey 🚀
          </Link>
        </div>
      </div>
    </header>
  );
}

function TechStackSection() {
  return (
    <div className={styles.techStackSection}>
      <Grid container spacing={4} padding={4}>
        {techStack.map((tech, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Link
              to={tech.link}
              className={styles.techCardLink}
              style={{ textDecoration: 'none' }}
            >
              <Paper
                elevation={3}
                className={styles.techCard}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{tech.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {tech.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tech.description}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="A blog about modern web development, architecture, and engineering best practices"
    >
      <HomepageHeader />
      <main>
        <TechStackSection />
      </main>
    </Layout>
  );
}
