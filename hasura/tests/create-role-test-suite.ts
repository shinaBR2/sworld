import { describe, test, expect } from "vitest";
import { GraphQLClient } from "graphql-request";

type QueryTestCase = {
  name: string;
  query: string;
  headers?: Record<string, string>;
  variables?: Record<string, unknown>;
  additionalTest?: (response: unknown) => void;
};

const createRoleTestSuite = (
  roleName: string,
  {
    queries = {
      allowed: [] as QueryTestCase[],
      denied: [] as QueryTestCase[],
      empty: [] as QueryTestCase[],
    },
    mutations = { allowed: [], denied: [] },
    token = "",
  }
) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const client = new GraphQLClient(
    `${process.env.HASURA_GRAPHQL_ENDPOINT}/v1/graphql`,
    { headers }
  );

  describe(`${roleName} Role Permissions`, () => {
    if (queries.allowed.length > 0) {
      describe("Allowed Queries", () => {
        test.each(queries.allowed)(
          "$name query is allowed",
          async ({ query, variables, additionalTest }) => {
            const response = await client.request(query, variables);

            // Run additional specific tests if provided
            if (additionalTest) {
              additionalTest(response);
            }
          }
        );
      });
    }

    // Test denied queries
    if (queries.denied.length > 0) {
      describe("Denied Queries", () => {
        test.each(queries.denied)(
          "$name query is denied",
          async ({ query, variables }) => {
            await expect(client.request(query, variables)).rejects.toThrow();
          }
        );
      });
    }

    // Test empty queries (queries that return empty results)
    if (queries.empty.length > 0) {
      describe("Empty Queries", () => {
        test.each(queries.empty)(
          "$name query returns empty result",
          async ({ query, variables, additionalTest }) => {
            const response = await client.request(query, variables);

            // Run additional specific tests if provided
            if (additionalTest) {
              additionalTest(response);
            }
          }
        );
      });
    }

    if (mutations.allowed.length > 0) {
      describe("Denied Mutations", () => {
        test.each(mutations.denied)(
          "$name mutation is allowed",
          async ({ mutation, variables }) => {
            const response = await client.request(mutation, variables);

            if (additionalTest) {
              additionalTest(response);
            }
          }
        );
      });
    }

    if (mutations.denied.length > 0) {
      describe("Denied Mutations", () => {
        test.each(mutations.denied)(
          "$name mutation is denied",
          async ({ mutation, variables }) => {
            await expect(client.request(mutation, variables)).rejects.toThrow();
          }
        );
      });
    }
  });
};

export { createRoleTestSuite };
