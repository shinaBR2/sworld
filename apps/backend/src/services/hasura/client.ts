import { GraphQLClient } from 'graphql-request';
import { envConfig } from 'src/utils/envConfig';

const createHasuraClient = (): GraphQLClient => {
  const endpoint = envConfig.hasuraEndpoint;
  const adminSecret = envConfig.hasuraAdminSecret;

  if (!endpoint) {
    throw new Error(
      'Hasura endpoint is not defined. Please check environment variables.',
    );
  }

  if (!adminSecret) {
    throw new Error(
      'Hasura admin secret is not defined. Please check environment variables.',
    );
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'x-hasura-admin-secret': adminSecret,
    },
  });
};

// Construct lazily on first use rather than at import time. Importing this
// module (often transitively, e.g. via an auto-mocked consumer in a test) must
// not throw when the Hasura env vars are absent — only an actual request should
// require them. The real client is still created once and reused.
let client: GraphQLClient | null = null;
const hasuraClient = new Proxy({} as GraphQLClient, {
  get(_target, prop, receiver) {
    if (!client) {
      client = createHasuraClient();
    }
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export { createHasuraClient, hasuraClient };
