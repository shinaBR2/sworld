import { GraphQLClient } from 'graphql-request';
import { envConfig } from 'src/utils/envConfig';

let hashnodeClient: GraphQLClient | null = null;

const createHashnodeClient = (): GraphQLClient => {
  const endpoint = envConfig.hashnodeEndpoint;
  const token = envConfig.hashnodePersonalToken;

  if (!endpoint) {
    throw new Error('Hashnode endpoint is not defined. Please check environment variables.');
  }

  if (!token) {
    throw new Error('Hashnode token is not defined. Please check environment variables.');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: token,
    },
  });
};

const getHashnodeClient = (): GraphQLClient => {
  if (!hashnodeClient) {
    hashnodeClient = createHashnodeClient();
  }
  return hashnodeClient;
};

export { createHashnodeClient, getHashnodeClient };
