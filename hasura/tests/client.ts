import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient(
  `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`
);

export default client;
