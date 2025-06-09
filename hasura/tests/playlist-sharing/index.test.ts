/**
 * IMPORTANT LIMITATION
 * - WE USE HASURA CLOUD FOR THIS TESTING, IT TRIGGER EVENT ON CREATED FOR VIDEO RECORDS
 * - SO WE CANNOT TEST INSERT VIDEO RECORDS
 * - WE CANNOT TEST THE CASE RECEIVER YET BECAUSE THE createRoleTestSuite
 * FOR NOW ONLY WORK WITH ONE SINGLE USER ACCOUNT (E2E_TEST_USER)
 */
import { expect } from "vitest";
import {
  createRoleTestSuite,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Anonymous users shouldn't be able to access shared_video_recipients or playlist sharing fields
const deniedAnonymousQueries: QueryTestCase[] = [
  {
    name: "Cannot query shared_video_recipients table",
    query: `
      query GetSharedVideoRecipients {
        shared_video_recipients {
          id
          playlistId
          videoId
          recipientId
          viewed
        }
      }
    `,
  },
  {
    name: "Cannot query playlist sharing fields",
    query: `
      query GetPlaylistSharing {
        playlist {
          id
          sharedRecipients
          sharedRecipientsInput
        }
      }
    `,
  },
];

// Authenticated users can query playlist sharing fields but not shared_video_recipients
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Can query playlist sharing fields",
    query: `
      query GetPlaylistSharing {
        playlist {
          id
          sharedRecipients
          sharedRecipientsInput
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("playlist");
      expect(Array.isArray(response.playlist)).toBe(true);
    },
  },
];

const deniedUserQueries: QueryTestCase[] = [
  {
    name: "Cannot query shared_video_recipients table",
    query: `
      query GetSharedVideoRecipients {
        shared_video_recipients {
          id
          playlistId
          videoId
          recipientId
          viewed
        }
      }
    `,
  },
];

// Tests for anonymous users - should be denied all access
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...deniedAnonymousQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [],
  },
});

// Tests for authenticated users - can access playlist sharing fields but not shared_video_recipients
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [...allowedUserQueries],
    denied: [...deniedUserQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [],
  },
});
