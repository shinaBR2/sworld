import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

const videoViewsQuery = `
  query GetUserVideoViews {
    video_views {
      id
      video_id
      viewed_at
    }
  }
`;

const videoViewsAggregateQuery = `
  query GetVideoViewsAggregate {
    video_views_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const deniedVideoViewsQuery = `
  query GetVideoViews {
    video_views {
      user_id
    }
  }
`;

const userAllowedQueries: QueryTestCase[] = [
  {
    name: "Get user video views",
    query: videoViewsQuery,
    additionalTest(response) {
      expect(Array.isArray(response.video_views)).toBe(true);
      if (response.video_views.length > 0) {
        const view = response.video_views[0];
        expect(view).toHaveProperty("id");
        expect(view).toHaveProperty("video_id");
        expect(view).toHaveProperty("viewed_at");
        expect(view).not.toHaveProperty("user_id");
      }
    },
  },
  {
    name: "Get video views aggregate",
    query: videoViewsAggregateQuery,
    additionalTest(response) {
      expect(response.video_views_aggregate.aggregate).toHaveProperty("count");
      expect(typeof response.video_views_aggregate.aggregate.count).toBe(
        "number"
      );
    },
  },
];

const commonDeniedQueries: QueryTestCase[] = [
  {
    name: "Get user_id from video views",
    query: deniedVideoViewsQuery,
  },
];

// Anonymous role test suite
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [
      ...commonDeniedQueries,
      {
        name: "Get any video views",
        query: videoViewsQuery,
      },
      {
        name: "Get video views aggregate",
        query: videoViewsAggregateQuery,
      },
    ],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [
      {
        name: "Insert video view",
        mutation: `
          mutation {
            insert_video_views_one(object: {
              video_id: "123"
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
        name: "Insert video view with different user_id",
        mutation: `
          mutation {
            insert_video_views_one(object: {
              user_id: "different-user",
              video_id: "123"
            }) {
              id
            }
          }
        `,
      },
    ],
  },
});
