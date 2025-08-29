const hasuraGraphqlUrl = `${import.meta.env.VITE_HASURA_DOMAIN}/v1/graphql`;

const queryConfig = {
  hasuraUrl: hasuraGraphqlUrl,
};

const mainDomain = import.meta.env.VITE_MAIN_SITE_URL;
const appConfig = {
  sites: {
    main: mainDomain,
    listen: `https://listen.${mainDomain}`,
    watch: `https://watch.${mainDomain}`,
    play: `https://play.${mainDomain}`,
    til: `https://til.${mainDomain}`,
  },
};

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_TOKEN!,
  environment: import.meta.env.VITE_ROLLBAR_ENV!,
};

const validateEnvVars = () => {
  const required = [
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

export { appConfig, queryConfig, rollbarConfig, validateEnvVars };
