import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Basic queries
const videoHistoryQuery = `
  query GetUserVideoHistory {
    user_video_history {
      id
      last_watched_at
      progress_seconds
      video_id
    }
  }
`;

// Denied queries that attempt to access unauthorized fields
const deniedVideoHistoryQuery = `
  query GetUserVideoHistory {
    user_video_history {
      user_id
    }
  }
`;

const userAllowedQueries: QueryTestCase[] = [
  {
    name: "Get user video history",
    query: videoHistoryQuery,
    additionalTest(response) {
      expect(Array.isArray(response.user_video_history)).toBe(true);
      if (response.user_video_history.length > 0) {
        const history = response.user_video_history[0];
        expect(history).toHaveProperty("id");
        expect(history).toHaveProperty("last_watched_at");
        expect(history).toHaveProperty("progress_seconds");
        expect(history).toHaveProperty("video_id");
        expect(history).not.toHaveProperty("user_id");
      }
    },
  },
];

const commonDeniedQueries: QueryTestCase[] = [
  {
    name: "Get user_id from video history",
    query: deniedVideoHistoryQuery,
  },
];

// Anonymous role test suite
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [
      ...commonDeniedQueries,
      {
        name: "Get any video history",
        query: videoHistoryQuery,
      },
    ],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [
      {
        name: "Insert video history",
        mutation: `
          mutation {
            insert_user_video_history_one(object: {
              video_id: "123",
              progress_seconds: 0
            }) {
              id
            }
          }
        `,
      },
    ],
  },
});

// User role test suite
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: userAllowedQueries,
    denied: commonDeniedQueries,
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [
      {
        name: "Insert video history with different user_id",
        mutation: `
          mutation {
            insert_user_video_history_one(object: {
              user_id: "different-user",
              video_id: "123",
              progress_seconds: 0
            }) {
              id
            }
          }
        `,
      },
    ],
  },
});
