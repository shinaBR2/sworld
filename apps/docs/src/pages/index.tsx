import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import styles from './index.module.css';

// Tech stack items with descriptions and links
const techStack = [
  {
    title: 'Hasura GraphQL',
    icon: '🗄️',
    description:
      'Instant GraphQL API for rapid development and real-time data access',
    link: '/blog/tags/hasura',
  },
  {
    title: 'Firebase',
    icon: '☁️',
    description:
      'Scalable backend infrastructure for hosting, storage, and real-time features',
    link: '/blog/tags/firebase',
  },
  {
    title: 'Auth0',
    icon: '🔒',
    description: 'Enterprise-grade authentication and authorization',
    link: '/blog/tags/auth-0',
  },
  {
    title: 'Serverless',
    icon: '⚡',
    description: 'Event-driven architecture with automatic scaling',
    link: '/blog/tags/serverless',
  },
  {
    title: 'PNPM',
    icon: '📦',
    description:
      'Fast, disk space efficient package manager with built-in monorepo support',
    // Since there's no PNPM tag yet, we'll point to the docs section
    link: '/blog/tags/pnpm', // You can adjust this path as needed
  },
  {
    title: 'Monorepo',
    icon: '🏗️',
    description:
      'High-performance monorepo management for optimal development workflow',
    link: '/blog/tags/monorepo',
  },
];

const HomepageHeader = () => {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
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
};

const TechStackSection = () => {
  return (
    <section className={styles.techStackSection}>
      <div className={clsx('container', styles.techGrid)}>
        {techStack.map((tech) => (
          <Link key={tech.title} to={tech.link} className={styles.techCardLink}>
            <div className={styles.techCard}>
              <span className={styles.techIcon} aria-hidden="true">
                {tech.icon}
              </span>
              <h3 className={styles.techTitle}>{tech.title}</h3>
              <p className={styles.techDescription}>{tech.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const Home = (): JSX.Element => {
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
};

export default Home;
