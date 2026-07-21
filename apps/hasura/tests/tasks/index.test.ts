import {
  createRoleTestSuite,
  MutationTestCase,
  QueryTestCase,
  ROLE_ANONYMOUS,
  ROLE_USER,
} from "../create-role-test-suite";

const deniedTasksQuery = `
  query GetTasks {
    tasks {
      id
    }
  }
`;

const deniedQueries: QueryTestCase[] = [
  {
    name: "Get tasks",
    query: deniedTasksQuery,
    variables: {
      site: "watch",
    },
  },
];
const deniedMutations: MutationTestCase[] = [
  {
    name: "Create task",
    mutation: `
      mutation CreateTaskRecord {
        insert_tasks_one(object: {
          task_id: "task_id",
          type: "type",
          entity_type: "video",
          entity_id: "123e4567-e89b-12d3-a456-426614174000",
          status: "pending"
        }) {
          id
          task_id
          created_at
        }
      }
    `,
  },
  {
    name: "Update task",
    mutation: `
      mutation UpdateTaskRecord {
        update_task_records_by_pk(
          pk_columns: { id: "123e4567-e89b-12d3-a456-426614174000" }
          _set: {
            status: "completed",
            completed_at: "2024-01-26T12:00:00Z"
            updated_at: "2024-01-26T12:00:00Z"
          }
        ) {
          id
          status
          completed_at
          updated_at
        }
      }
    `,
  },
  {
    name: "Delete task",
    mutation: `
      mutation DeleteTaskRecord {
        delete_task_records_by_pk(id: "123e4567-e89b-12d3-a456-426614174000") {
          id
          task_id
        }
      }
    `,
  },
];

await createRoleTestSuite(ROLE_ANONYMOUS, {
  queries: {
    allowed: [],
    denied: [...deniedQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [...deniedMutations],
  },
});
await createRoleTestSuite(ROLE_USER, {
  queries: {
    allowed: [],
    denied: [...deniedQueries],
    empty: [],
  },
  mutations: {
    allowed: [],
    denied: [...deniedMutations],
  },
});
