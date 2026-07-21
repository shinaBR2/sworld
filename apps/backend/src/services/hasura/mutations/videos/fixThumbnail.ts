import { graphql } from '../../generated-graphql';
import type {
  FixVideoThumbnailMutation,
  FixVideoThumbnailMutationVariables,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

// Single mutation = single Hasura transaction: the thumbnail update and the task
// completion either both apply or neither does. Replaces the former Sequelize
// transaction in the fix-thumbnail handler.
const FIX_VIDEO_THUMBNAIL = graphql(/* GraphQL */ `
  mutation FixVideoThumbnail($id: uuid!, $thumbnailUrl: String!, $taskId: uuid!) {
    update_videos_by_pk(
      pk_columns: { id: $id }
      _set: { thumbnailUrl: $thumbnailUrl }
    ) {
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

interface FixVideoThumbnailParams {
  id: string;
  thumbnailUrl: string;
  taskId: string;
}

const fixVideoThumbnail = async ({
  id,
  thumbnailUrl,
  taskId,
}: FixVideoThumbnailParams) => {
  const response = await hasuraClient.request<
    FixVideoThumbnailMutation,
    FixVideoThumbnailMutationVariables
  >({
    document: FIX_VIDEO_THUMBNAIL.toString(),
    variables: { id, thumbnailUrl, taskId },
  });

  if (!response.update_videos_by_pk) {
    throw new Error(`Video with ID ${id} not found`);
  }

  if ((response.update_tasks?.affected_rows ?? 0) === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  return response;
};

export { fixVideoThumbnail };
