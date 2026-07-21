import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import type {
  SetVideoThumbnailMutation,
  SetVideoThumbnailMutationVariables,
} from '../../generated-graphql/graphql';

// Lean, single-purpose update: set only `thumbnailUrl` on one video. Unlike
// `fixVideoThumbnail`, it is NOT coupled to a `tasks` row — the
// `setVideoThumbnailAtTime` action is a direct user request, not a task.
const SET_VIDEO_THUMBNAIL = graphql(/* GraphQL */ `
  mutation SetVideoThumbnail($id: uuid!, $thumbnailUrl: String!) {
    update_videos_by_pk(
      pk_columns: { id: $id }
      _set: { thumbnailUrl: $thumbnailUrl }
    ) {
      id
      thumbnailUrl
    }
  }
`);

interface SetVideoThumbnailParams {
  id: string;
  thumbnailUrl: string;
}

const setVideoThumbnail = async ({
  id,
  thumbnailUrl,
}: SetVideoThumbnailParams) => {
  const response = await hasuraClient.request<
    SetVideoThumbnailMutation,
    SetVideoThumbnailMutationVariables
  >({
    document: SET_VIDEO_THUMBNAIL.toString(),
    variables: { id, thumbnailUrl },
  });

  if (!response.update_videos_by_pk) {
    throw new Error(`Video with ID ${id} not found`);
  }

  return response.update_videos_by_pk;
};

export { setVideoThumbnail };
