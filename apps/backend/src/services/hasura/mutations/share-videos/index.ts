import { graphql } from '../../generated-graphql';
import {
  InsertshareMutation,
  InsertshareMutationVariables,
  Shared_Video_Recipients_Insert_Input,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const INSERT_SHARED_VIDEO_RECIPIENTS = graphql(/* GraphQL */ `
  mutation insertshare(
    $objects: [shared_video_recipients_insert_input!]!
    $playlistId: uuid!
    $sharedRecipients: jsonb!
  ) {
    insert_shared_video_recipients(
      objects: $objects
      on_conflict: { constraint: shared_video_recipients_playlist_id_video_id_receiver_id_key, update_columns: [] }
    ) {
      returning {
        id
      }
    }
    update_playlist_by_pk(pk_columns: { id: $playlistId }, _set: { sharedRecipients: $sharedRecipients }) {
      id
      sharedRecipients
    }
  }
`);

const insertSharedVideoRecipients = async (
  objects: Array<Shared_Video_Recipients_Insert_Input>,
  playlistId: string,
  emails: string[]
): Promise<{
  insert_shared_video_recipients: { returning: Array<{ id: string }> };
  update_playlist_by_pk: { id: string; sharedRecipients: string[] };
}> => {
  const variables = {
    objects,
    playlistId,
    sharedRecipients: emails,
  };

  const response = await hasuraClient.request<InsertshareMutation, InsertshareMutationVariables>({
    document: INSERT_SHARED_VIDEO_RECIPIENTS.toString(),
    variables: variables,
  });
  if (!response.insert_shared_video_recipients || !response.update_playlist_by_pk) {
    throw new Error('Failed to insert shared video recipients or update playlist');
  }

  return {
    insert_shared_video_recipients: {
      returning: response.insert_shared_video_recipients.returning.map(record => ({
        id: String(record.id),
      })),
    },
    update_playlist_by_pk: {
      id: response.update_playlist_by_pk.id,
      sharedRecipients: response.update_playlist_by_pk.sharedRecipients,
    },
  };
};

export { insertSharedVideoRecipients };
