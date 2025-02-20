import { expect } from "vitest";
import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Queries that should be allowed for anonymous users
const allowedQueries: QueryTestCase[] = [
  {
    name: "Get public videos",
    query: `
      query GetPublicVideos {
        videos {
          id
          title
          description
          slug
          thumbnailUrl
          source
        }
      }
    `,
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("videos");
      expect(Array.isArray(response.videos)).toBe(true);

      // Check if each video has all the permitted columns
      if (response.videos.length > 0) {
        const video = response.videos[0];
        expect(video).toHaveProperty("id");
        expect(video).toHaveProperty("title");
        expect(video).toHaveProperty("description");
        expect(video).toHaveProperty("slug");
        expect(video).toHaveProperty("thumbnailUrl");
        expect(video).toHaveProperty("source");
      }
    },
  },
  {
    name: "Get video by id",
    query: `
      query GetVideoById($id: uuid!) {
        videos_by_pk(id: $id) {
          id
          title
          description
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("videos_by_pk");

      // Check if video has all the permitted columns
      const video = response.videos_by_pk;
      if (video) {
        expect(video).toHaveProperty("id");
        expect(video).toHaveProperty("title");
        expect(video).toHaveProperty("description");
      }
    },
  },
];

// Queries that should be denied for anonymous users
const deniedQueries: QueryTestCase[] = [
  {
    name: "Get user videos",
    // This query should be denied because it returns the createdAt column
    query: `
      query GetUserVideos {
        videos {
          createdAt
        }
      }
    `,
  },
  {
    name: "Get video by id",
    // This query should be denied because it returns the createdAt column
    query: `
      query GetVideoById($id: uuid!) {
        videos_by_pk(id: $id) {
          id
          createdAt
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
];

// Mutations that should be denied for anonymous users
const deniedMutations: MutationTestCase[] = [
  {
    name: "Insert video",
    mutation: `
      mutation InsertVideo($object: videos_insert_input!) {
        insert_videos_one(object: $object) {
          id
          title
          description
        }
      }
    `,
    variables: {
      object: {
        title: "Test Video",
        description: "Test Description",
        slug: "test-video",
        video_url: "https://example.com/video.mp4",
        public: false,
      },
    },
  },
];

// Queries that should be allowed for authenticated users
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own videos",
    query: `
      query GetOwnVideos {
        videos {
          id
          title
          description
          slug
          thumbnailUrl
          duration
          source
          createdAt
        }
      }
    `,
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("videos");
      expect(Array.isArray(response.videos)).toBe(true);

      // Check if each video has all the permitted columns
      if (response.videos.length > 0) {
        const video = response.videos[0];
        expect(video).toHaveProperty("id");
        expect(video).toHaveProperty("title");
        expect(video).toHaveProperty("description");
        expect(video).toHaveProperty("slug");
        expect(video).toHaveProperty("thumbnailUrl");
        expect(video).toHaveProperty("duration");
        expect(video).toHaveProperty("source");
        expect(video).toHaveProperty("createdAt");
      }
    },
  },
];

// TODO
// Handle whole life cycle for case insert then delete
// Mutations that should be allowed for authenticated users
// const allowedUserMutations: MutationTestCase[] = [
//   {
//     name: "Insert own video",
//     mutation: `
//       mutation InsertOwnVideo($object: videos_insert_input!) {
//         insert_videos_one(object: $object) {
//           id
//           title
//           description
//           slug
//           video_url
//           public
//         }
//       }
//     `,
//     variables: {
//       object: {
//         title: "My Test Video",
//         description: "My Test Description",
//         slug: "my-test-video",
//         video_url: "https://example.com/video.mp4",
//         public: false,
//       },
//     },
//     additionalTest: (response) => {
//       // Verify the response structure and inserted data
//       expect(response).toHaveProperty("insert_videos_one");
//       const video = response.insert_videos_one;
//       expect(video).toHaveProperty("id");
//       expect(video.title).toBe("My Test Video");
//       expect(video.description).toBe("My Test Description");
//       expect(video.slug).toBe("my-test-video");
//     },
//   },
// ];

// Test suite for anonymous role
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [...allowedQueries],
    denied: deniedQueries,
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: deniedMutations,
  },
});

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
