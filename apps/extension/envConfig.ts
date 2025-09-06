const hasuraConfig = {
  url: import.meta.env.VITE_HASURA_GRAPHQL_URL as string,
  codegenToken: import.meta.env.VITE_CODEGEN_TOKEN as string,
};

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_TOKEN!,
  environment: import.meta.env.VITE_ROLLBAR_ENV!,
};

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  cookieDomain: `.${import.meta.env.VITE_MAIN_SITE_URL}`,
  redirectUri: window.location.origin,
};

const extensionId = 'egfcglaomminlahocafmecmilaplbock';

const postHogApiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const postHogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
};

export {
  auth0Config,
  extensionId,
  hasuraConfig,
  postHogApiKey,
  postHogOptions,
  rollbarConfig,
};
