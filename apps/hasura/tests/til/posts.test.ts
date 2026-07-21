import { expect } from "vitest";
import {
	createRoleTestSuite,
	type QueryTestCase,
	ROLE_ANONYMOUS,
	ROLE_USER,
} from "../create-role-test-suite";

const allPostsQuery = `
  query AllPosts {
    posts {
      brief
      id
      markdownContent
      readTimeInMinutes
      title
      slug
      status
      visibility
      authorId
      pinned
    }
  }
`;

// Query to test that user can see own posts (any status/visibility)
const ownPostsQuery = `
  query OwnPosts {
    posts(where: {authorId: {_eq: "X-Hasura-User-Id"}}) {
      id
      title
      status
      visibility
      authorId
    }
  }
`;

// Query to test visibility of other users' public posts (any status)
const otherUserPublicPostsQuery = `
  query OtherUserPublicPosts {
    posts(where: {visibility: {_eq: "public"}, authorId: {_neq: "X-Hasura-User-Id"}}) {
      id
      title
      status
      visibility
      authorId
    }
  }
`;

const allowedAnonymousQueries: QueryTestCase[] = [
	{
		name: "Get all public posts",
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
				expect(post).toHaveProperty("markdownContent");
				expect(post).toHaveProperty("readTimeInMinutes");
				expect(post).toHaveProperty("slug");
				expect(post).toHaveProperty("status");
				expect(post).toHaveProperty("visibility");
				expect(post).toHaveProperty("authorId");
				expect(post).toHaveProperty("pinned");

				// Anonymous users should only see public posts (any status)
				expect(post.visibility).toBe("public");
			}
		},
	},
];

const allowedUserQueries: QueryTestCase[] = [
	{
		name: "Get accessible posts as user",
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
				expect(post).toHaveProperty("markdownContent");
				expect(post).toHaveProperty("readTimeInMinutes");
				expect(post).toHaveProperty("slug");
				expect(post).toHaveProperty("status");
				expect(post).toHaveProperty("visibility");
				expect(post).toHaveProperty("authorId");
				expect(post).toHaveProperty("pinned");
			}
		},
	},
	{
		name: "User can see own posts (any status/visibility)",
		query: ownPostsQuery,
		additionalTest: (response) => {
			expect(response).toHaveProperty("posts");
			expect(Array.isArray(response.posts)).toBe(true);

			// User should see all their own posts regardless of status or visibility
			if (response.posts.length > 0) {
				response.posts.forEach((post: { authorId: string }) => {
					expect(post.authorId).toBe("X-Hasura-User-Id");
				});
			}
		},
	},
	{
		name: "User can see other users public posts (any status)",
		query: otherUserPublicPostsQuery,
		additionalTest: (response) => {
			expect(response).toHaveProperty("posts");
			expect(Array.isArray(response.posts)).toBe(true);

			// All returned posts should be public (can be any status: draft, published, archived)
			response.posts.forEach((post: { visibility: string }) => {
				expect(post.visibility).toBe("public");
			});
		},
	},
];

// Empty queries - user should not see other users' private posts
const emptyUserQueries: QueryTestCase[] = [
	{
		name: "User cannot see other users private posts",
		query: `
      query OtherUserPrivatePosts {
        posts(where: {visibility: {_eq: "private"}, authorId: {_neq: "X-Hasura-User-Id"}}) {
          id
          title
          status
          visibility
          authorId
        }
      }
    `,
		additionalTest: (response) => {
			// Should return empty array - users cannot see other users' private posts
			expect(response).toHaveProperty("posts");
			expect(response.posts).toHaveLength(0);
		},
	},
];

// Test for anonymous role
await createRoleTestSuite(ROLE_ANONYMOUS, {
	queries: {
		allowed: [...allowedAnonymousQueries],
		denied: [],
		empty: [],
	},
});

// Test for authenticated user role
await createRoleTestSuite(ROLE_USER, {
	queries: {
		allowed: [...allowedUserQueries],
		denied: [],
		empty: [...emptyUserQueries],
	},
});
