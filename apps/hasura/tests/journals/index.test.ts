import { expect } from "vitest";
import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

// Sample journal data for testing
// Update sample record to include tags
const sampleRecord = {
  content: "This is a test journal content",
  mood: "happy",
  date: "2024-01-20",
  tags: ["test", "journal"],
};

const testState: { journalId?: string } = {};

// Anonymous user shouldn't be able to access journals
const deniedJournalQueries: QueryTestCase[] = [
  {
    name: "Get journals",
    query: `
      query GetJournals {
        journals {
          id
          content
          mood
          date
          tags
        }
      }
    `,
  },
];

// Update denied mutations
const deniedJournalMutations: MutationTestCase[] = [
  {
    name: "Create journal",
    mutation: `
      mutation CreateJournal($object: journals_insert_input!) {
        insert_journals_one(object: $object) {
          id
          content
          mood
          date
          tags
        }
      }
    `,
    variables: {
      object: sampleRecord,
    },
  },
];

// Authenticated user (ROLE_USER) should be able to access their own journals
const allowedUserQueries: QueryTestCase[] = [
  {
    name: "Get own journals",
    query: `
      query GetJournals {
        journals {
          id
          content
          mood
          date
          tags
          createdAt
          updatedAt
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("journals");
      expect(Array.isArray(response.journals)).toBe(true);
    },
  },
  {
    name: "Get journals with aggregates",
    query: `
      query GetJournalsAggregates {
        journals_aggregate {
          aggregate {
            count
          }
          nodes {
            id
            content
            mood
            date
            tags
          }
        }
      }
    `,
    additionalTest: (response) => {
      expect(response).toHaveProperty("journals_aggregate");
      expect(response.journals_aggregate).toHaveProperty("aggregate");
      expect(response.journals_aggregate.aggregate).toHaveProperty("count");
    },
  },
];

// Update allowed mutations
const allowedUserMutations: MutationTestCase[] = [
  {
    name: "Create journal",
    mutation: `
      mutation CreateJournal($object: journals_insert_input!) {
        insert_journals_one(object: $object) {
          id
          date
          content
          mood
          tags
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      object: sampleRecord,
    },
    additionalTest: (response) => {
      expect(response).toHaveProperty("insert_journals_one");
      const record = response.insert_journals_one;
      expect(record).toHaveProperty("id");
      testState.journalId = record.id;
    },
  },
  {
    name: "Update journal",
    mutation: `
      mutation UpdateJournal($id: uuid!, $object: journals_set_input!) {
        update_journals_by_pk(pk_columns: { id: $id }, _set: $object) {
          id
          content
          mood
          date
          tags
        }
      }
    `,
    variables: () => ({
      id: testState.journalId,
      object: {
        content: "Updated content for testing",
        mood: "excited",
        tags: ["updated", "test"],
      },
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("update_journals_by_pk");
      const updated = response.update_journals_by_pk;
      expect(updated.mood).toBe("excited");
      expect(updated.tags).toEqual(["updated", "test"]);
    },
  },
  {
    name: "Delete journal",
    mutation: `
      mutation DeleteJournal($id: uuid!) {
        delete_journals_by_pk(id: $id) {
          id
          date
        }
      }
    `,
    variables: () => ({
      id: testState.journalId,
    }),
    additionalTest: (response) => {
      expect(response).toHaveProperty("delete_journals_by_pk");
      expect(response.delete_journals_by_pk.id).toBe(testState.journalId);
    },
  },
];

// Tests for anonymous users - should be denied all access
await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...deniedJournalQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [...deniedJournalMutations],
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
