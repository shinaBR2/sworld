import { expect } from "vitest";
import {
  createRoleTestSuite,
  // MutationTestCase,
  QueryTestCase,
  // ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";
// import { e2eTestUserId } from "../config";

// Allowed queries for anonymous users
// const allowedQueries: QueryTestCase[] = [
//   {
//     name: "Get public books",
//     query: `
//       query GetPublicBooks {
//         books(where: {isPublic: {_eq: true}}) {
//           id
//           title
//           author
//           description
//           publishedAt
//         }
//       }
//     `,
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("books");
//       expect(Array.isArray(response.books)).toBe(true);
//       if (response.books.length > 0) {
//         const book = response.books[0];
//         expect(book).toHaveProperty("id");
//         expect(book).toHaveProperty("title");
//         expect(book).toHaveProperty("author");
//         expect(book).toHaveProperty("description");
//         expect(book).toHaveProperty("publishedAt");
//       }
//     },
//   },
//   {
//     name: "Get book by id",
//     query: `
//       query GetBookById($id: uuid!) {
//         books_by_pk(id: $id) {
//           id
//           title
//           author
//           description
//         }
//       }
//     `,
//     variables: {
//       id: "123e4567-e89b-12d3-a456-426614174000",
//     },
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("books_by_pk");
//       const book = response.books_by_pk;
//       if (book) {
//         expect(book).toHaveProperty("id");
//         expect(book).toHaveProperty("title");
//         expect(book).toHaveProperty("author");
//         expect(book).toHaveProperty("description");
//       }
//     },
//   },
// ];

// // Denied queries for anonymous users
// const deniedQueries: QueryTestCase[] = [
//   {
//     name: "Get user-only books",
//     query: `
//       query GetUserBooks {
//         books {
//           ownerId
//         }
//       }
//     `,
//   },
//   {
//     name: "Get book by id (ownerId)",
//     query: `
//       query GetBookById($id: uuid!) {
//         books_by_pk(id: $id) {
//           id
//           ownerId
//         }
//       }
//     `,
//     variables: {
//       id: "123e4567-e89b-12d3-a456-426614174000",
//     },
//   },
// ];

// // Denied mutations for anonymous users
// const deniedMutations: MutationTestCase[] = [
//   {
//     name: "Insert book",
//     mutation: `
//       mutation InsertBook($object: books_insert_input!) {
//         insert_books_one(object: $object) {
//           id
//           title
//           author
//         }
//       }
//     `,
//     variables: {
//       object: {
//         title: "Test Book",
//         author: "Test Author",
//         description: "Test Description",
//         isPublic: false,
//       },
//     },
//   },
// ];

// Allowed queries for authenticated users
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own books",
    query: `
      query GetOwnBooks {
        books {
          id
          title
          source
          thumbnailUrl
          createdAt
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("books");
      expect(Array.isArray(response.books)).toBe(true);
      if (response.books.length > 0) {
        const book = response.books[0];
        expect(book).toHaveProperty("id");
        expect(book).toHaveProperty("title");
        expect(book).toHaveProperty("source");
        expect(book).toHaveProperty("thumbnailUrl");
        expect(book).toHaveProperty("createdAt");
      }
    },
  },
];

// Allowed mutations for authenticated users (example, currently empty)
// const allowedUserMutations: MutationTestCase[] = [
//   {
//     name: "Insert own book",
//     mutation: `
//       mutation InsertOwnBook($object: books_insert_input!) {
//         insert_books_one(object: $object) {
//           id
//           title
//           author
//           description
//         }
//       }
//     `,
//     variables: {
//       object: {
//         title: "My Test Book",
//         author: "My Author",
//         description: "My Description",
//         isPublic: true,
//       },
//     },
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("insert_books_one");
//       const book = response.insert_books_one;
//       expect(book).toHaveProperty("id");
//       expect(book.title).toBe("My Test Book");
//       expect(book.author).toBe("My Author");
//     },
//   },
// ];

// Test suite for anonymous role
// await createRoleTestSuite(ROLE_ANONYMOUS, {
//   queries: {
//     allowed: [...allowedQueries],
//     denied: deniedQueries,
//     empty: [],
//   },
//   mutations: {
//     allowed: [],
//     denied: deniedMutations,
//   },
// });

// Test suite for authenticated user role
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: allowedUserQueries,
    denied: [],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [],
  },
});
