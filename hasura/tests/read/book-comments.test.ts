import { expect } from "vitest";
import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Queries that should be allowed for user role (select only)
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get book comments",
    query: `
      query GetBookComments($bookId: uuid!) {
        book_comments(where: { bookId: { _eq: $bookId } }) {
          id
          content
          createdAt
        }
      }
    `,
    variables: {
      bookId: "123e4567-e89b-12d3-a456-426614174000",
    },
    additionalTest: (response) => {
      expect(response).toHaveProperty("book_comments");
      expect(Array.isArray(response.book_comments)).toBe(true);

      if (response.book_comments.length > 0) {
        const comment = response.book_comments[0];
        expect(comment).toHaveProperty("id");
        expect(comment).toHaveProperty("content");
        expect(comment).toHaveProperty("createdAt");
      }
    },
  },
];

// Mutations that should be denied for user role
const deniedMutations: MutationTestCase[] = [
  {
    name: "Insert book comment",
    mutation: `
      mutation InsertBookComment($object: book_comments_insert_input!) {
        insert_book_comments_one(object: $object) {
          id
          content
          bookId
          userId
        }
      }
    `,
    variables: {
      object: {
        content: "Test comment",
        bookId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      },
    },
  },
  {
    name: "Update book comment",
    mutation: `
      mutation UpdateBookComment($id: uuid!, $updates: book_comments_set_input!) {
        update_book_comments_by_pk(pk_columns: { id: $id }, _set: $updates) {
          id
          content
          createdAt
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      updates: {
        content: "Updated comment",
      },
    },
  },
  {
    name: "Delete book comment",
    mutation: `
      mutation DeleteBookComment($id: uuid!) {
        delete_book_comments_by_pk(id: $id) {
          id
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
];

// Test suite for anonymous role - deny everything
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [
      {
        name: "Get book comments should be denied for anonymous",
        query: `
          query {
            book_comments {
              id
              content
              createdAt
            }
          }
        `,
      },
    ],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: deniedMutations,
  },
});

// Test suite for user role - allow selects only
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: allowedUserQueries,
    denied: [],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: deniedMutations,
  },
});
