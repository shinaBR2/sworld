import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

const allPostsQuery = `
  query AllPosts {
    posts {
      brief
      id
      markdown_content
      readTimeInMinutes
      title
    }
  }
`;

const allowedQueries: QueryTestCase[] = [
  {
    name: "Get all posts",
    query: allPostsQuery,
    additionalTest: (response) => {
      // Verify response structure
      expect(response).toHaveProperty("posts");
      expect(Array.isArray(response.posts)).toBe(true);

      // If posts exist, verify they have the expected fields
      if (response.posts.length > 0) {
        const post = response.posts[0];
        expect(post).toHaveProperty("id");
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("brief");
        expect(post).toHaveProperty("markdown_content");
        expect(post).toHaveProperty("readTimeInMinutes");
      }
    },
  },
];

// Test for anonymous role
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [...allowedQueries],
    denied: [],
    empty: [],
  },
});

// Test for authenticated user role
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...allowedQueries],
    denied: [],
    empty: [],
  },
});
