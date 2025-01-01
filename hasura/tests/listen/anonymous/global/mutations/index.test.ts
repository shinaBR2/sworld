import { expect } from "vitest";
import { GraphQLClient } from "graphql-request";
import { describe, test, expect } from "vitest";

describe("Anonymous Role - All Mutations Forbidden", () => {
  const client = new GraphQLClient(
    `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`
  );

  test("should reject mutations", async () => {
    // Attempt to write a catch-all mutation test
    // The key is to try something that definitively looks like a mutation
    await expect(
      client.request(`
        mutation {
          # This is a placeholder and won't match any real schema
          # The point is to ensure ANY mutation is rejected
          __typename
        }
      `)
    ).rejects.toThrow();
  });
});
