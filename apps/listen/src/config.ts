const hasuraGraphqlUrl = `${import.meta.env.VITE_HASURA_DOMAIN}/v1/graphql`;

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: hasuraGraphqlUrl,
  cookieDomain: `.${import.meta.env.VITE_MAIN_SITE_URL}`,
  redirectUri: window.location.origin,
};
const queryConfig = {
  hasuraUrl: hasuraGraphqlUrl,
};
const appConfig = {
  sites: {
    main: import.meta.env.VITE_MAIN_SITE_URL,
    listen: import.meta.env.VITE_LISTEN_SITE_URL,
    watch: import.meta.env.VITE_WATCH_SITE_URL,
    play: import.meta.env.VITE_PLAY_SITE_URL,
  },
};
const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  release: import.meta.env.VITE_RELEASE,
  site: 'listen',
};
const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_TOKEN!,
  environment: import.meta.env.VITE_ROLLBAR_ENV!,
};

const validateEnvVars = () => {
  const required = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_HASURA_DOMAIN',
    'VITE_MAIN_SITE_URL',
    'VITE_LISTEN_SITE_URL',
    'VITE_WATCH_SITE_URL',
    'VITE_PLAY_SITE_URL',
    // 'VITE_SENTRY_DSN',
    // 'VITE_ENVIRONMENT',
    // 'VITE_RELEASE',
    'VITE_ROLLBAR_TOKEN',
    'VITE_ROLLBAR_ENV',
  ];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export { auth0Config, queryConfig, appConfig, sentryConfig, rollbarConfig, validateEnvVars };
