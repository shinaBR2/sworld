import { expect } from "vitest";
import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Sample data for testing
const sampleVideo = {
  title: "Test Video",
  description: "Test Description",
  url: "https://example.com/video.mp4",
  thumbnail_url: "https://example.com/thumbnail.jpg",
};

const testState: { 
  videoId?: string;
  sharedVideoId?: string;
  receiverId?: string;
} = {};

// Anonymous user shouldn't be able to access shared videos
const deniedSharedVideoQueries: QueryTestCase[] = [
  {
    name: "Get shared videos",
    query: `
      query GetSharedVideos {
        shared_videos {
          id
          video_id
          owner_id
          active
          video {
            title
            description
          }
        }
      }
    `,
  },
  {
    name: "Get shared video recipients",
    query: `
      query GetSharedVideoRecipients {
        shared_video_recipients {
          id
          shared_video_id
          receiver_id
          viewed
        }
      }
    `,
  },
];

const deniedSharedVideoMutations: MutationTestCase[] = [
  {
    name: "Create shared video",
    mutation: `
      mutation CreateSharedVideo($video_id: uuid!, $owner_id: uuid!) {
        insert_shared_videos_one(object: {
          video_id: $video_id,
          owner_id: $owner_id
        }) {
          id
          video_id
          owner_id
          active
        }
      }
    `,
    variables: {
      video_id: "00000000-0000-0000-0000-000000000000",
      owner_id: "00000000-0000-0000-0000-000000000000",
    },
  },
];

// Authenticated user should be able to manage shared videos
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own shared videos",
    query: `
      query GetOwnSharedVideos {
        shared_videos(where: {owner_id: {_eq: "X-Hasura-User-Id"}}) {
          id
          video_id
          owner_id
          active
          video {
            title
            description
          }
          shared_video_recipients {
            id
            receiver_id
            viewed
          }
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("shared_videos");
      expect(Array.isArray(response.shared_videos)).toBe(true);
    },
  },
  {
    name: "Get received shared videos",
    query: `
      query GetReceivedSharedVideos {
        shared_video_recipients(where: {receiver_id: {_eq: "X-Hasura-User-Id"}}) {
          id
          shared_video {
            id
            video {
              title
              description
              url
            }
            owner_id
          }
          viewed
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("shared_video_recipients");
      expect(Array.isArray(response.shared_video_recipients)).toBe(true);
    },
  },
];

const allowedUserMutations: MutationTestCase[] = [
  {
    name: "Create video first",
    mutation: `
      mutation CreateVideo($object: videos_insert_input!) {
        insert_videos_one(object: $object) {
          id
          title
          description
          url
          thumbnail_url
        }
      }
    `,
    variables: {
      object: sampleVideo,
    },
    additionalTest: (response) => {
      expect(response).toHaveProperty("insert_videos_one");
      const video = response.insert_videos_one;
      expect(video).toHaveProperty("id");
      testState.videoId = video.id;
    },
  },
  {
    name: "Share video with another user",
    mutation: `
      mutation ShareVideo($object: shared_videos_insert_input!) {
        insert_shared_videos_one(object: $object) {
          id
          video_id
          owner_id
          active
          shared_video_recipients {
            id
            receiver_id
            viewed
          }
        }
      }
    `,
    variables: () => ({
      object: {
        video_id: testState.videoId,
        active: true,
        shared_video_recipients: {
          data: [
            {
              receiver_id: testState.receiverId,
              viewed: false,
            },
          ],
        },
      },
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("insert_shared_videos_one");
      const sharedVideo = response.insert_shared_videos_one;
      expect(sharedVideo).toHaveProperty("id");
      testState.sharedVideoId = sharedVideo.id;
      expect(sharedVideo.shared_video_recipients).toHaveLength(1);
    },
  },
  {
    name: "Update shared video status",
    mutation: `
      mutation UpdateSharedVideo($id: uuid!, $active: Boolean!) {
        update_shared_videos_by_pk(
          pk_columns: { id: $id }
          _set: { active: $active }
        ) {
          id
          active
        }
      }
    `,
    variables: () => ({
      id: testState.sharedVideoId,
      active: false,
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("update_shared_videos_by_pk");
      expect(response.update_shared_videos_by_pk.active).toBe(false);
    },
  },
  {
    name: "Mark shared video as viewed",
    mutation: `
      mutation MarkSharedVideoAsViewed($shared_video_id: uuid!) {
        update_shared_video_recipients(
          where: {
            shared_video_id: { _eq: $shared_video_id }
          }
          _set: { viewed: true }
        ) {
          affected_rows
          returning {
            id
            viewed
          }
        }
      }
    `,
    variables: () => ({
      shared_video_id: testState.sharedVideoId,
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("update_shared_video_recipients");
      expect(response.update_shared_video_recipients.affected_rows).toBeGreaterThan(0);
      expect(response.update_shared_video_recipients.returning[0].viewed).toBe(true);
    },
  },
  {
    name: "Delete shared video",
    mutation: `
      mutation DeleteSharedVideo($id: uuid!) {
        delete_shared_videos_by_pk(id: $id) {
          id
          video_id
        }
      }
    `,
    variables: () => ({
      id: testState.sharedVideoId,
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("delete_shared_videos_by_pk");
      expect(response.delete_shared_videos_by_pk.id).toBe(testState.sharedVideoId);
    },
  },
];

// Tests for anonymous users - should be denied all access
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...deniedSharedVideoQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [...deniedSharedVideoMutations],
  },
});

// Tests for authenticated users - should have proper access
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...allowedUserQueries],
    denied: [],
    empty: [],
  },
  mutations: {
    allowed: [...allowedUserMutations],
    denied: [],
  },
});
