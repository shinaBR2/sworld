/**
 * IMPORTANT LIMITATION
 * - WE USE HASURA CLOUD FOR THIS TESTING, IT TRIGGER EVENT ON CREATED FOR VIDEO RECORDS
 * - SO WE CANNOT TEST INSERT VIDEO RECORDS
 * - WE CANNOT TEST THE CASE RECEIVER YET BECAUSE THE createRoleTestSuite
 * FOR NOW ONLY WORK WITH ONE SINGLE USER ACCOUNT (E2E_TEST_USER)
 */

import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
} from "../create-role-test-suite";

// Sample data for testing
// const sampleVideo = {
//   title: "Test Video",
//   description: "Test Description",
//   video_url: "https://example.com/video.mp4",
//   slug: `test-video-${Date.now()}`,
//   public: false,
// };

// const testState: {
//   videoId?: string;
//   sharedVideoId?: string;
// } = {};

// Anonymous user shouldn't be able to access shared videos
const deniedSharedVideoQueries: QueryTestCase[] = [
  {
    name: "Get shared videos",
    query: `
      query GetSharedVideos {
        shared_videos {
          id
          videoId
          ownerId
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
          sharedVideoId
          receiverId
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
      mutation CreateSharedVideo($videoId: uuid!, $ownerId: uuid!) {
        insert_shared_videos_one(object: {
          videoId: $videoId,
          ownerId: $ownerId
        }) {
          id
          videoId
          ownerId
          active
        }
      }
    `,
    variables: {
      videoId: "00000000-0000-0000-0000-000000000000",
      ownerId: "00000000-0000-0000-0000-000000000000",
    },
  },
];

// Authenticated user should be able to manage shared videos
// const allowedOwnerQueries: QueryTestCase[] = [
//   {
//     name: "Get own shared videos",
//     query: `
//       query GetOwnSharedVideos {
//         shared_videos {
//           id
//           videoId
//           ownerId
//           active
//           video {
//             title
//             description
//           }
//           shared_video_recipients {
//             id
//             receiverId
//             viewed
//           }
//         }
//       }
//     `,
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("shared_videos");
//       expect(Array.isArray(response.shared_videos)).toBe(true);
//     },
//   },
// ];

// const deniedReceiverQueries: QueryTestCase[] = [
//   {
//     name: "Cannot query shared video recipients",
//     query: `
//       query GetSharedVideoRecipients {
//         shared_video_recipients {
//           id
//           sharedVideoId
//           receiverId
//           viewed
//         }
//       }
//     `,
//   },
// ];

// const ownerMutations: MutationTestCase[] = [
//   {
//     name: "Create video first",
//     mutation: `
//       mutation CreateVideo($object: videos_insert_input!) {
//         insert_videos_one(
//           object: $object
//         ) {
//           id
//           title
//           description
//           source
//           slug
//         }
//       }
//     `,
//     variables: {
//       object: sampleVideo,
//     },
//     additionalTest: async (response) => {
//       console.log(
//         "[DEBUG] Create video response:",
//         JSON.stringify(response, null, 2)
//       );
//       expect(response).toHaveProperty("insert_videos_one");
//       const video = response.insert_videos_one;
//       console.log("[DEBUG] Created video:", JSON.stringify(video, null, 2));
//       expect(video).toHaveProperty("id");
//       testState.videoId = video.id;
//       console.log(
//         "[DEBUG] Updated testState:",
//         JSON.stringify(testState, null, 2)
//       );
//     },
//   },
//   {
//     name: "Share video with another user",
//     mutation: `
//       mutation ShareVideo($object: shared_videos_insert_input!) {
//         insert_shared_videos_one(object: $object) {
//           id
//           videoId
//           ownerId
//           active
//           shared_video_recipients {
//             id
//             receiverId
//           }
//         }
//       }
//     `,
//     variables: () => {
//       console.log(`[DEBUG] test state video id`, testState.videoId);
//       return {
//         object: {
//           videoId: testState.videoId,
//           active: true,
//           shared_video_recipients: {
//             data: [
//               {
//                 receiverId: "550e8400-e29b-41d4-a716-446655440000",
//               },
//             ],
//           },
//         },
//       };
//     },
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("insert_shared_videos_one");
//       const sharedVideo = response.insert_shared_videos_one;
//       expect(sharedVideo).toHaveProperty("id");
//       testState.sharedVideoId = sharedVideo.id;

//       console.log(`[DEBUG] shared video id`, sharedVideo.id);
//       expect(sharedVideo.shared_video_recipients).toHaveLength(1);
//     },
//   },
//   {
//     name: "Update shared video active status",
//     mutation: `
//       mutation UpdateSharedVideo($id: uuid!, $active: Boolean!) {
//         update_shared_videos_by_pk(
//           pk_columns: { id: $id }
//           _set: { active: $active }
//         ) {
//           id
//           active
//         }
//       }
//     `,
//     variables: () => ({
//       id: testState.sharedVideoId,
//       active: false,
//     }),
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("update_shared_videos_by_pk");
//       expect(response.update_shared_videos_by_pk.active).toBe(false);
//     },
//   },
//   {
//     name: "Delete shared video recipient",
//     mutation: `
//       mutation DeleteSharedVideoRecipient($sharedVideoId: uuid!) {
//         delete_shared_video_recipients(
//           where: { sharedVideoId: { _eq: $sharedVideoId } }
//         ) {
//           affected_rows
//           returning {
//             id
//           }
//         }
//       }
//     `,
//     variables: () => ({
//       sharedVideoId: testState.sharedVideoId,
//     }),
//     additionalTest: (response) => {
//       expect(response).toHaveProperty("delete_shared_video_recipients");
//       expect(
//         response.delete_shared_video_recipients.affected_rows
//       ).toBeGreaterThan(0);
//     },
//   },
// ];

// // Mutations that should be denied for the receiver
// const deniedReceiverMutations: MutationTestCase[] = [
//   {
//     name: "Receiver cannot update shared video",
//     mutation: `
//       mutation UpdateSharedVideo($id: uuid!, $active: Boolean!) {
//         update_shared_videos_by_pk(
//           pk_columns: { id: $id }
//           _set: { active: $active }
//         ) {
//           id
//           active
//         }
//       }
//     `,
//     variables: () => ({
//       id: testState.sharedVideoId,
//       active: false,
//     }),
//   },
//   {
//     name: "Receiver cannot create shared video",
//     mutation: `
//       mutation ShareVideo($object: shared_videos_insert_input!) {
//         insert_shared_videos_one(object: $object) {
//           id
//           videoId
//           ownerId
//           active
//         }
//       }
//     `,
//     variables: () => ({
//       object: {
//         videoId: testState.videoId,
//         active: true,
//       },
//     }),
//   },
//   {
//     name: "Receiver cannot delete shared video recipient",
//     mutation: `
//       mutation DeleteSharedVideoRecipient($sharedVideoId: uuid!) {
//         delete_shared_video_recipients(
//           where: { sharedVideoId: { _eq: $sharedVideoId } }
//         ) {
//           affected_rows
//         }
//       }
//     `,
//     variables: () => ({
//       sharedVideoId: testState.sharedVideoId,
//     }),
//   },
// ];

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

// Tests for owner role - should have proper access
// await createRoleTestSuite(ROLE_USER, {
//   queries: {
//     allowed: [...allowedOwnerQueries],
//     denied: [],
//     empty: [],
//   },
//   mutations: {
//     allowed: [...ownerMutations],
//     denied: [],
//   },
// });

// // Tests for receiver role - should have limited access
// await createRoleTestSuite(ROLE_USER, {
//   queries: {
//     allowed: [],
//     denied: [...deniedReceiverQueries],
//     empty: [],
//   },
//   mutations: {
//     allowed: [],
//     denied: [...deniedReceiverMutations],
//   },
// });
