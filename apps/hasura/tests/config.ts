const e2eTestUserId = process.env.E2E_TEST_USER_ID;
const auth0Domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_E2E_CLIENT_ID;
const clientSecret = process.env.AUTH0_E2E_CLIENT_SECRET;
const hasuraEndpoint = `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`;

export { e2eTestUserId, auth0Domain, clientId, clientSecret, hasuraEndpoint };
