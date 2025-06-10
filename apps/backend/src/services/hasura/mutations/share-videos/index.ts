import { graphql } from '../../generated-graphql';
import {
  SharePlaylistMutation,
  SharePlaylistMutationVariables,
  ShareVideoMutation,
  ShareVideoMutationVariables,
  Shared_Playlist_Recipients_Insert_Input,
  Shared_Video_Recipients_Insert_Input,
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

const SHARE_VIDEO_MUTATION = graphql(/* GraphQL */ `
  mutation shareVideo($objects: [shared_video_recipients_insert_input!]!, $videoId: uuid!, $sharedRecipients: jsonb!) {
    insert_shared_video_recipients(
      objects: $objects
      on_conflict: { constraint: shared_video_recipients_video_id_recipient_id_key, update_columns: [] }
    ) {
      returning {
        id
      }
    }
    update_videos_by_pk(pk_columns: { id: $videoId }, _set: { sharedRecipients: $sharedRecipients }) {
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

const shareVideo = async (
  objects: Array<Shared_Video_Recipients_Insert_Input>,
  videoId: string,
  emails: string[]
): Promise<{
  insert_shared_video_recipients: { returning: Array<{ id: string }> };
  update_videos_by_pk: { id: string; sharedRecipients: string[] };
}> => {
  const variables = {
    objects,
    videoId,
    sharedRecipients: emails,
  };

  const response = await hasuraClient.request<ShareVideoMutation, ShareVideoMutationVariables>({
    document: SHARE_VIDEO_MUTATION.toString(),
    variables: variables,
  });
  if (!response.insert_shared_video_recipients || !response.update_videos_by_pk) {
    throw new Error('Failed to insert shared video recipients or update video');
  }

  return {
    insert_shared_video_recipients: {
      returning: response.insert_shared_video_recipients.returning.map(record => ({
        id: String(record.id),
      })),
    },
    update_videos_by_pk: {
      id: response.update_videos_by_pk.id,
      sharedRecipients: response.update_videos_by_pk.sharedRecipients,
    },
  };
};

export { sharePlaylist, shareVideo };
