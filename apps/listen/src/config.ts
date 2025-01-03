const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  cookieDomain: `.${import.meta.env.VITE_MAIN_SITE_URL}`,
  redirectUri: window.location.origin,
};
const queryConfig = {
  hasuraUrl: import.meta.env.VITE_HASURA_GRAPHQL_URL,
};
const appConfig = {
  sites: {
    main: import.meta.env.VITE_MAIN_SITE_URL,
    listen: import.meta.env.VITE_LISTEN_SITE_URL,
    watch: import.meta.env.VITE_WATCH_SITE_URL,
    play: import.meta.env.VITE_PLAY_SITE_URL,
  },
};
const systemConfig = {
  logRocket: import.meta.env.VITE_LOGROCKET_APP_ID,
};

const validateEnvVars = () => {
  const required = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_HASURA_GRAPHQL_URL',
    'VITE_MAIN_SITE_URL',
    'VITE_LISTEN_SITE_URL',
    'VITE_WATCH_SITE_URL',
    'VITE_PLAY_SITE_URL',
    'VITE_LOGROCKET_APP_ID',
  ];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

export { auth0Config, queryConfig, appConfig, systemConfig, validateEnvVars };
