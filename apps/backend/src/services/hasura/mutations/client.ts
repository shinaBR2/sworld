import { GraphQLClient } from 'graphql-request';
import { envConfig } from 'src/utils/envConfig';

const createHasuraClient = (): GraphQLClient => {
  const endpoint = envConfig.hasuraEndpoint;
  const adminSecret = envConfig.hasuraAdminSecret;

  if (!endpoint) {
    throw new Error('Hasura endpoint is not defined. Please check environment variables.');
  }

  if (!adminSecret) {
    throw new Error('Hasura admin secret is not defined. Please check environment variables.');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'x-hasura-admin-secret': adminSecret,
    },
  });
};

const hasuraClient = createHasuraClient();

export { createHasuraClient, hasuraClient };
