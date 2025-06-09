import { graphql } from '../../generated-graphql';
import {
  SharePlaylistMutation,
  SharePlaylistMutationVariables,
  Shared_Playlist_Recipients_Insert_Input,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const SHARE_PLAYLIST_MUTATION = graphql(/* GraphQL */ `
  mutation sharePlaylist(
    $objects: [shared_playlist_recipients_insert_input!]!
    $playlistId: uuid!
    $sharedRecipients: jsonb!
  ) {
    insert_shared_playlist_recipients(
      objects: $objects
      on_conflict: { constraint: shared_playlist_recipients_playlist_id_recipient_id_key, update_columns: [] }
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

const sharePlaylist = async (
  objects: Array<Shared_Playlist_Recipients_Insert_Input>,
  playlistId: string,
  emails: string[]
): Promise<{
  insert_shared_playlist_recipients: { returning: Array<{ id: string }> };
  update_playlist_by_pk: { id: string; sharedRecipients: string[] };
}> => {
  const variables = {
    objects,
    playlistId,
    sharedRecipients: emails,
  };

  const response = await hasuraClient.request<SharePlaylistMutation, SharePlaylistMutationVariables>({
    document: SHARE_PLAYLIST_MUTATION.toString(),
    variables: variables,
  });
  if (!response.insert_shared_playlist_recipients || !response.update_playlist_by_pk) {
    throw new Error('Failed to insert shared playlist recipients or update playlist');
  }

  return {
    insert_shared_playlist_recipients: {
      returning: response.insert_shared_playlist_recipients.returning.map(record => ({
        id: String(record.id),
      })),
    },
    update_playlist_by_pk: {
      id: response.update_playlist_by_pk.id,
      sharedRecipients: response.update_playlist_by_pk.sharedRecipients,
    },
  };
};

export { sharePlaylist };
