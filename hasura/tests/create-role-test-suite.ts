import fetch from "node-fetch";
import { describe, test, expect } from "vitest";
import { GraphQLClient } from "graphql-request";
import { auth0Domain, clientId, clientSecret, hasuraEndpoint } from "./config";

type QueryTestCase = {
  name: string;
  query: string;
  headers?: Record<string, string>;
  variables?: Record<string, unknown>;
  additionalTest?: (response: unknown) => void;
};

const ROLE_ANONYMOUS = "anonymous";
const ROLE_USER = "user";

const initClient = async (requireToken = false) => {
  let token = "";

  if (requireToken) {
    if (!auth0Domain || !clientId || !clientSecret) {
      throw new Error("Required Auth0 environment variables are missing");
    }

    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: hasuraEndpoint,
        grant_type: "client_credentials",
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(`Auth0 error: ${JSON.stringify(data)}`);
    }

    token = data.access_token;
  }
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const client = new GraphQLClient(hasuraEndpoint, { headers });

  return client;
};

const createRoleTestSuite = async (
  roleName: string,
  {
    queries = {
      allowed: [] as QueryTestCase[],
      denied: [] as QueryTestCase[],
      empty: [] as QueryTestCase[],
    },
    mutations = { allowed: [], denied: [] },
    requireToken = false,
  }
) => {
  const client = await initClient(requireToken);

  describe(`${roleName} Role Permissions`, () => {
    if (queries.allowed.length > 0) {
      describe("Allowed Queries", () => {
        test.each(queries.allowed)(
          "$name query is allowed",
          async ({ query, variables, additionalTest }) => {
            const response = await client.request(query, variables);

            // Run additional specific tests if provided
            if (additionalTest) {
              additionalTest(response, roleName);
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
              additionalTest(response, roleName);
            }
          }
        );
      });
    }

    if (mutations.allowed.length > 0) {
      describe("Allowed Mutations", () => {
        test.each(mutations.allowed)(
          "$name mutation is allowed",
          async ({ mutation, variables, additionalTest }) => {
            const response = await client.request(mutation, variables);

            if (additionalTest) {
              additionalTest(response, roleName);
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

export { ROLE_ANONYMOUS, ROLE_USER, createRoleTestSuite };
