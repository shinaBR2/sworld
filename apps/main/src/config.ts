const hasuraGraphqlUrl = `${import.meta.env.VITE_HASURA_DOMAIN}/v1/graphql`;

const extensionId = import.meta.env.VITE_EXTENSION_ID;
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

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_TOKEN!,
  environment: import.meta.env.VITE_ROLLBAR_ENV!,
};

const mainDomain = import.meta.env.VITE_MAIN_SITE_URL;
const appConfig = {
  sites: {
    main: import.meta.env.VITE_MAIN_SITE_URL,
    listen: `https://listen.${mainDomain}`,
    watch: `https://watch.${mainDomain}`,
    play: `https://play.${mainDomain}`,
    til: `https://til.${mainDomain}`,
  },
};

const validateEnvVars = () => {
  const required = [
    'VITE_AUTH0_DOMAIN',
    'VITE_AUTH0_CLIENT_ID',
    'VITE_HASURA_DOMAIN',
    'VITE_MAIN_SITE_URL',
    'VITE_ROLLBAR_TOKEN',
    'VITE_ROLLBAR_ENV',
  ];
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
};

export {
  appConfig,
  extensionId,
  auth0Config,
  queryConfig,
  rollbarConfig,
  validateEnvVars,
};
