import { nanoid } from 'nanoid';
import { graphql } from '../../generated-graphql';
import type {
  FinalizeVideoMutation,
  FinalizeVideoMutationVariables,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const FINALIZE_VIDEO = graphql(/* GraphQL */ `
  mutation FinalizeVideo(
    $taskId: uuid!
    $notificationObject: notifications_insert_input!
    $videoId: uuid!
    $videoUpdates: videos_set_input!
  ) {
    # Update task status to completed
    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {
      affected_rows
      returning {
        id
      }
    }

    # Add notification
    insert_notifications_one(object: $notificationObject) {
      id
    }

    # Finalize video using the input type
    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {
      id
    }
  }
`);

const finishVideoProcess = async (
  variables: FinalizeVideoMutationVariables,
): Promise<string> => {
  const shortId = nanoid(11);
  const response = await hasuraClient.request<
    FinalizeVideoMutation,
    FinalizeVideoMutationVariables
  >({
    document: FINALIZE_VIDEO.toString(),
    variables: {
      ...variables,
      videoUpdates: {
        ...variables.videoUpdates,
        sId: shortId,
      },
    },
  });
  return response.insert_notifications_one?.id;
};

export { finishVideoProcess };
