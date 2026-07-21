import { graphql } from '../../generated-graphql';
import type {
  FixVideoDurationMutation,
  FixVideoDurationMutationVariables,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

// Single mutation = single Hasura transaction: the video duration update and the
// task completion either both apply or neither does. Replaces the former
// Sequelize transaction in the fix-duration handler.
const FIX_VIDEO_DURATION = graphql(/* GraphQL */ `
  mutation FixVideoDuration($id: uuid!, $duration: Int!, $taskId: uuid!) {
    update_videos_by_pk(pk_columns: { id: $id }, _set: { duration: $duration }) {
      id
    }
    update_tasks(
      where: { task_id: { _eq: $taskId } }
      _set: { status: "completed", completed: true }
    ) {
      affected_rows
    }
  }
`);

interface FixVideoDurationParams {
  id: string;
  duration: number;
  taskId: string;
}

const fixVideoDuration = async ({
  id,
  duration,
  taskId,
}: FixVideoDurationParams) => {
  const response = await hasuraClient.request<
    FixVideoDurationMutation,
    FixVideoDurationMutationVariables
  >({
    document: FIX_VIDEO_DURATION.toString(),
    variables: { id, duration, taskId },
  });

  if (!response.update_videos_by_pk) {
    throw new Error(`Video with ID ${id} not found`);
  }

  if ((response.update_tasks?.affected_rows ?? 0) === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  return response;
};

export { fixVideoDuration };
