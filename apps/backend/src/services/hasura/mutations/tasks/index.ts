import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import type {
  CompleteTaskMutation,
  CompleteTaskMutationVariables,
  CreateTaskMutation,
  CreateTaskMutationVariables,
  UpdateTaskStatusMutation,
  UpdateTaskStatusMutationVariables,
} from '../../generated-graphql/graphql';
import { TaskStatus } from './constants';

// Upsert keyed by `task_id`. `update_columns: [task_id]` is a no-op self-update
// (EXCLUDED.task_id equals the existing value) — this is deliberate: it makes the
// statement `ON CONFLICT DO UPDATE` rather than `DO NOTHING`, so `returning` gives
// back the existing row (including `completed`) on conflict. `update_columns: []`
// would compile to `DO NOTHING` and return null on conflict.
const CREATE_TASK = graphql(/* GraphQL */ `
  mutation CreateTask($object: tasks_insert_input!) {
    insert_tasks_one(
      object: $object
      on_conflict: { constraint: tasks_task_id_key, update_columns: [task_id] }
    ) {
      id
      task_id
      status
      completed
    }
  }
`);

const UPDATE_TASK_STATUS = graphql(/* GraphQL */ `
  mutation UpdateTaskStatus($taskId: uuid!, $status: String!) {
    update_tasks(
      where: { task_id: { _eq: $taskId } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`);

const COMPLETE_TASK = graphql(/* GraphQL */ `
  mutation CompleteTask($taskId: uuid!) {
    update_tasks(
      where: { task_id: { _eq: $taskId } }
      _set: { status: "completed", completed: true }
    ) {
      affected_rows
    }
  }
`);

interface CreateTaskParams {
  taskId: string;
  type: string;
  metadata: Record<string, unknown>;
  entityType: string;
  entityId: string;
}

const createTask = async ({
  taskId,
  type,
  metadata,
  entityType,
  entityId,
}: CreateTaskParams) => {
  if (!taskId || !type || !metadata || !entityType || !entityId) {
    throw new Error('Missing required fields for task creation');
  }

  const response = await hasuraClient.request<
    CreateTaskMutation,
    CreateTaskMutationVariables
  >({
    document: CREATE_TASK.toString(),
    variables: {
      object: {
        task_id: taskId,
        type,
        metadata,
        entity_id: entityId,
        entity_type: entityType,
        status: TaskStatus.PENDING,
        completed: false,
      },
    },
  });

  return response.insert_tasks_one;
};

interface UpdateTaskStatusParams {
  taskId: string;
  status: TaskStatus;
}

const updateTaskStatus = async ({ taskId, status }: UpdateTaskStatusParams) => {
  const response = await hasuraClient.request<
    UpdateTaskStatusMutation,
    UpdateTaskStatusMutationVariables
  >({
    document: UPDATE_TASK_STATUS.toString(),
    variables: { taskId, status },
  });

  const affectedRows = response.update_tasks?.affected_rows ?? 0;
  if (affectedRows === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  return affectedRows;
};

interface CompleteTaskParams {
  taskId: string;
}

const completeTask = async ({ taskId }: CompleteTaskParams) => {
  const response = await hasuraClient.request<
    CompleteTaskMutation,
    CompleteTaskMutationVariables
  >({
    document: COMPLETE_TASK.toString(),
    variables: { taskId },
  });

  const affectedRows = response.update_tasks?.affected_rows ?? 0;
  if (affectedRows === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  return affectedRows;
};

export { completeTask, createTask, updateTaskStatus };
