// tests/permissions.test.ts
import { GraphQLClient } from "graphql-request";

describe("Permission Tests", () => {
  console.log(
    "Running tests/permissions.test.ts",
    process.env.HASURA_GRAPHQL_ENDPOINT
  );
  const anonClient = new GraphQLClient("http://localhost:8080/v1/graphql");
  const userClient = new GraphQLClient("http://localhost:8080/v1/graphql", {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  test("anonymous cannot access private articles", async () => {
    const query = `
      query GetPrivateArticles {
        articles(where: { is_private: { _eq: true }}) {
          id
          title
        }
      }
    `;

    await expect(anonClient.request(query)).rejects.toThrow(
      /permission denied/
    );
  });
});
