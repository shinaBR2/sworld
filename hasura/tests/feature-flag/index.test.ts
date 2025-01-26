import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

const featureFlagQuery = `
  query FeatureFlag($site: String!) {
    feature_flag(where: {site: {_eq: $site}}) {
      id
      name
      conditions
    }
  }
`;
const deniedFeatureFlagQuery = `
  query FeatureFlag($site: String!) {
    feature_flag(where: {site: {_eq: $site}}) {
      description
    }
  }
`;

const anonymousAllowedQueries: QueryTestCase[] = [
  {
    name: "Get single feature flag for watch site",
    query: featureFlagQuery,
    variables: {
      site: "watch",
    },
    additionalTest(response, roleName) {
      if (roleName == ROLE_ANONYMOUS) {
        return;
      }

      expect(response.feature_flag.length).toBe(1);
    },
  },
  {
    name: "Get single feature flag for listen site",
    query: featureFlagQuery,
    variables: {
      site: "listen",
    },
    additionalTest(response, roleName) {
      if (roleName == ROLE_ANONYMOUS) {
        return;
      }

      expect(response.feature_flag.length).toBe(0);
    },
  },
];

const userDeniedQueries: QueryTestCase[] = [
  {
    name: "Get description",
    query: deniedFeatureFlagQuery,
    variables: {
      site: "watch",
    },
  },
  {
    name: "Get description",
    query: deniedFeatureFlagQuery,
    variables: {
      site: "listen",
    },
  },
];

await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...userDeniedQueries],
    empty: [...anonymousAllowedQueries],
  },
  mutations: {
    allowed: [],
    denied: [
      {
        name: "All",
        mutation: `
          mutation {
            # This is a placeholder and won't match any real schema
            # The point is to ensure ANY mutation is rejected
            __typename
          }
        `,
      },
    ],
  },
});

await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...anonymousAllowedQueries],
    denied: [...userDeniedQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [
      {
        name: "All",
        mutation: `
          mutation {
            insert_feature_flag_one(object: {
              name: "test",
              site: "watch"
            }) {
              id
            }
          }
        `,
      },
    ],
  },
});
