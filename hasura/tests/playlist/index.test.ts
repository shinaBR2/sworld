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
    name: "Get public playlists",
    query: `
      query GetPublicPlaylists {
        playlist(where: {playlist_videos: {}}) {
          id
          title
          description
          slug
          thumbnailUrl
          public
          createdAt
        }
      }
    `,
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("playlist");
      expect(Array.isArray(response.playlist)).toBe(true);

      // Check if each playlist has all the permitted columns
      if (response.playlist.length > 0) {
        const playlist = response.playlist[0];
        expect(playlist).toHaveProperty("id");
        expect(playlist).toHaveProperty("title");
        expect(playlist).toHaveProperty("description");
        expect(playlist).toHaveProperty("slug");
        expect(playlist).toHaveProperty("thumbnailUrl");
        expect(playlist).toHaveProperty("public");
        expect(playlist).toHaveProperty("createdAt");
        expect(playlist.public).toBe(true);
      }
    },
  },
  {
    name: "Get public playlist by id",
    query: `
      query GetPlaylistById($id: uuid!) {
        playlist_by_pk(id: $id) {
          id
          title
          description
          slug
          thumbnailUrl
          public
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("playlist_by_pk");

      // Check if playlist has all the permitted columns
      const playlist = response.playlist_by_pk;
      if (playlist) {
        expect(playlist).toHaveProperty("id");
        expect(playlist).toHaveProperty("title");
        expect(playlist).toHaveProperty("description");
        expect(playlist).toHaveProperty("slug");
        expect(playlist).toHaveProperty("thumbnailUrl");
        expect(playlist).toHaveProperty("public");
        expect(playlist.public).toBe(true);
      }
    },
  },
];

// Queries that should be denied for anonymous users
const deniedQueries: QueryTestCase[] = [
  {
    name: "Get playlists with updatedAt",
    // This query should be denied because it returns the updatedAt column
    query: `
      query GetPlaylistsWithCreatedAt {
        playlist {
          id
          updatedAt
        }
      }
    `,
  },
  {
    name: "Get playlist by id with updatedAt",
    // This query should be denied because it returns the updatedAt column
    query: `
      query GetPlaylistByIdWithCreatedAt($id: uuid!) {
        playlist_by_pk(id: $id) {
          id
          updatedAt
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
  {
    name: "Get playlist_videos junction table",
    query: `
      query GetPlaylistVideos {
        playlist_videos {
          id
        }
      }
    `,
  },
];

// Mutations that should be denied for anonymous users
const deniedMutations: MutationTestCase[] = [
  {
    name: "Insert playlist",
    mutation: `
      mutation InsertPlaylist {
        insert_playlist_one(object: {
          title: "Test Playlist",
          description: "A test playlist",
          slug: "test-playlist",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          public: true
        }) {
          id
          title
        }
      }
    `,
  },
  {
    name: "Update playlist",
    mutation: `
      mutation UpdatePlaylist($id: uuid!) {
        update_playlist_by_pk(
          pk_columns: { id: $id },
          _set: { title: "Updated Playlist" }
        ) {
          id
          title
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
  {
    name: "Delete playlist",
    mutation: `
      mutation DeletePlaylist($id: uuid!) {
        delete_playlist_by_pk(id: $id) {
          id
        }
      }
    `,
    variables: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  },
];

// Queries that should be allowed for authenticated users
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own playlists",
    query: `
      query GetOwnPlaylists {
        playlist(where: {playlist_videos: {}}) {
          id
          title
          description
          slug
          thumbnailUrl
          public
          createdAt
        }
      }
    `,
    additionalTest: (response) => {
      // Check if response has the expected structure
      expect(response).toHaveProperty("playlist");
      expect(Array.isArray(response.playlist)).toBe(true);

      // Check if each playlist has all the permitted columns
      if (response.playlist.length > 0) {
        const playlist = response.playlist[0];
        expect(playlist).toHaveProperty("id");
        expect(playlist).toHaveProperty("title");
        expect(playlist).toHaveProperty("description");
        expect(playlist).toHaveProperty("slug");
        expect(playlist).toHaveProperty("thumbnailUrl");
        expect(playlist).toHaveProperty("public");
        expect(playlist).toHaveProperty("createdAt");
      }
    },
  },
];

// TODO
// Handle whole life cycle for case insert then delete
// Mutations that should be allowed for authenticated users
// const allowedUserMutations: MutationTestCase[] = [
//   {
//     name: "Insert own playlist",
//     mutation: `
//       mutation InsertOwnPlaylist {
//         insert_playlist_one(object: {
//           title: "My Test Playlist",
//           description: "My test playlist description",
//           slug: "my-test-playlist",
//           thumbnailUrl: "https://example.com/my-thumbnail.jpg",
//           public: false
//         }) {
//           id
//           title
//           description
//           slug
//           public
//         }
//       }
//     `,
//     additionalTest: (response) => {
//       // Verify the response structure and inserted data
//       expect(response).toHaveProperty("insert_playlist_one");
//       const playlist = response.insert_playlist_one;
//       expect(playlist).toHaveProperty("id");
//       expect(playlist.title).toBe("My Test Playlist");
//       expect(playlist.description).toBe("My test playlist description");
//       expect(playlist.slug).toBe("my-test-playlist");
//       expect(playlist.public).toBe(false);
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
