import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

const postDetailQuery = `
  query PostDetail($id: uuid!) {
    posts_by_pk(id: $id) {
      brief
      id
      markdownContent
      readTimeInMinutes
      title
    }
  }
`;

const allowedQueries: QueryTestCase[] = [
  {
    name: "Get post detail",
    query: postDetailQuery,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
    additionalTest: (response) => {
      expect(response).toHaveProperty("posts_by_pk");
      const post = response.posts_by_pk;
      if (post) {
        expect(post).toHaveProperty("id");
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("brief");
        expect(post).toHaveProperty("markdown_content");
        expect(post).toHaveProperty("readTimeInMinutes");
      }
    },
  },
];

// Test suite for anonymous role
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [...allowedQueries],
    denied: [],
    empty: [],
  },
});

// Test suite for authenticated user role
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...allowedQueries],
    denied: [],
    empty: [],
  },
});
