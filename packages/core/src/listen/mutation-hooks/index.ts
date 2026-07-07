import { graphql } from '../../graphql';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const LISTEN_SITE = 'listen';

const createPlaylistMutation = graphql(/* GraphQL */ `
  mutation CreateListenPlaylist($object: playlist_insert_input!) {
    insert_playlist_one(object: $object) {
      id
      slug
    }
  }
`);

const addAudioMutation = graphql(/* GraphQL */ `
  mutation AddAudioToPlaylist($object: playlist_audios_insert_input!) {
    insert_playlist_audios_one(object: $object) {
      playlist_id
      audio_id
      position
    }
  }
`);

const removeAudioMutation = graphql(/* GraphQL */ `
  mutation RemoveAudioFromPlaylist($playlistId: uuid!, $audioId: uuid!) {
    delete_playlist_audios_by_pk(playlist_id: $playlistId, audio_id: $audioId) {
      playlist_id
      audio_id
    }
  }
`);

const reorderAudiosMutation = graphql(/* GraphQL */ `
  mutation ReorderPlaylistAudios($updates: [playlist_audios_updates!]!) {
    update_playlist_audios_many(updates: $updates) {
      affected_rows
      returning {
        playlist_id
      }
    }
  }
`);

const updateAudioMutation = graphql(/* GraphQL */ `
  mutation UpdateAudio($id: uuid!, $set: audios_set_input!) {
    update_audios_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`);

const deleteAudioMutation = graphql(/* GraphQL */ `
  mutation DeleteAudio($id: uuid!) {
    delete_audios_by_pk(id: $id) {
      id
    }
  }
`);

const assignFeelingMutation = graphql(/* GraphQL */ `
  mutation AssignFeeling($object: audio_tags_insert_input!) {
    insert_audio_tags_one(object: $object) {
      audio_id
      tag_id
    }
  }
`);

const unassignFeelingMutation = graphql(/* GraphQL */ `
  mutation UnassignFeeling($audioId: uuid!, $tagId: uuid!) {
    delete_audio_tags_by_pk(audio_id: $audioId, tag_id: $tagId) {
      audio_id
      tag_id
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

interface CreateListenPlaylistInput {
  title: string;
  slug: string;
  thumbnailUrl: string;
  description?: string;
}

interface PlaylistAudioRef {
  playlistId: string;
  audioId: string;
}

type AddAudioInput = PlaylistAudioRef & { position: number };
type ReorderUpdate = PlaylistAudioRef & { position: number };

interface UpdateAudioInput {
  id: string;
  name?: string;
  artistName?: string;
  thumbnailUrl?: string;
}

// A feeling assignment is one row in the audio_tags join (audio <-> listen tag).
interface FeelingRef {
  audioId: string;
  tagId: string;
}

// The management dashboard (SWO-411) is a signed-in, user-only screen, so its
// query has no anonymous variant — a single exact key is enough. Audio edits
// also touch the home screen (a public audio the owner renamed), so both are
// invalidated on success.
const MANAGE_QUERY_KEY = ['listen-manage'];
const HOME_QUERY_KEY = 'listen-home';

const useCreatePlaylist = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: createPlaylistMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        invalidateQuery(['listen-playlists']);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Create listen playlist failed:', error);
        onError?.(error);
      },
    },
  });

  // Always stamp site='listen' so the playlist stays scoped to the listen app.
  const createPlaylist = (input: CreateListenPlaylistInput) =>
    mutateAsync({ object: { ...input, site: LISTEN_SITE } });

  return createPlaylist;
};

const useAddAudioToPlaylist = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: addAudioMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const playlistId = data.insert_playlist_audios_one?.playlist_id;
        if (playlistId) {
          invalidateQuery(['listen-playlist-detail', playlistId]);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Add audio to playlist failed:', error);
        onError?.(error);
      },
    },
  });

  const addAudio = (input: AddAudioInput) =>
    mutateAsync({
      object: {
        playlist_id: input.playlistId,
        audio_id: input.audioId,
        position: input.position,
      },
    });

  return addAudio;
};

const useRemoveAudioFromPlaylist = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: removeAudioMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const playlistId = data.delete_playlist_audios_by_pk?.playlist_id;
        if (playlistId) {
          invalidateQuery(['listen-playlist-detail', playlistId]);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Remove audio from playlist failed:', error);
        onError?.(error);
      },
    },
  });

  const removeAudio = (input: PlaylistAudioRef) =>
    mutateAsync({ playlistId: input.playlistId, audioId: input.audioId });

  return removeAudio;
};

const useReorderPlaylistAudios = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: reorderAudiosMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        const playlistIds = new Set(
          data.update_playlist_audios_many?.flatMap(
            (result) => result?.returning.map((row) => row.playlist_id) ?? [],
          ),
        );
        for (const playlistId of playlistIds) {
          invalidateQuery(['listen-playlist-detail', playlistId]);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Reorder playlist audios failed:', error);
        onError?.(error);
      },
    },
  });

  const reorderAudios = (updates: ReorderUpdate[]) =>
    mutateAsync({
      updates: updates.map((update) => ({
        where: {
          playlist_id: { _eq: update.playlistId },
          audio_id: { _eq: update.audioId },
        },
        _set: { position: update.position },
      })),
    });

  return reorderAudios;
};

const useUpdateAudio = (props: MutationProps = {}) => {
  const { getAccessToken, isSignedIn } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: updateAudioMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        // A null pk result means no row matched (absent or filtered by
        // permissions) — nothing changed, so leave the caches untouched.
        if (data.update_audios_by_pk) {
          invalidateQuery(MANAGE_QUERY_KEY);
          invalidateQuery([HOME_QUERY_KEY, isSignedIn]);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Update audio failed:', error);
        onError?.(error);
      },
    },
  });

  // Only the provided fields are sent; undefined ones drop out on serialisation
  // so they are left untouched.
  const updateAudio = (input: UpdateAudioInput) => {
    const { id, ...fields } = input;
    return mutateAsync({ id, set: fields });
  };

  return updateAudio;
};

const useDeleteAudio = (props: MutationProps = {}) => {
  const { getAccessToken, isSignedIn } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: deleteAudioMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        // Only refresh caches when a row was actually deleted.
        if (data.delete_audios_by_pk) {
          invalidateQuery(MANAGE_QUERY_KEY);
          invalidateQuery([HOME_QUERY_KEY, isSignedIn]);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Delete audio failed:', error);
        onError?.(error);
      },
    },
  });

  const deleteAudio = (id: string) => mutateAsync({ id });

  return deleteAudio;
};

const useAssignFeeling = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: assignFeelingMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        if (data.insert_audio_tags_one) {
          invalidateQuery(MANAGE_QUERY_KEY);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Assign feeling failed:', error);
        onError?.(error);
      },
    },
  });

  const assignFeeling = (input: FeelingRef) =>
    mutateAsync({ object: { audio_id: input.audioId, tag_id: input.tagId } });

  return assignFeeling;
};

const useUnassignFeeling = (props: MutationProps = {}) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    document: unassignFeelingMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        if (data.delete_audio_tags_by_pk) {
          invalidateQuery(MANAGE_QUERY_KEY);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Unassign feeling failed:', error);
        onError?.(error);
      },
    },
  });

  const unassignFeeling = (input: FeelingRef) =>
    mutateAsync({ audioId: input.audioId, tagId: input.tagId });

  return unassignFeeling;
};

export {
  type AddAudioInput,
  type CreateListenPlaylistInput,
  type FeelingRef,
  type PlaylistAudioRef,
  type ReorderUpdate,
  type UpdateAudioInput,
  useAddAudioToPlaylist,
  useAssignFeeling,
  useCreatePlaylist,
  useDeleteAudio,
  useRemoveAudioFromPlaylist,
  useReorderPlaylistAudios,
  useUnassignFeeling,
  useUpdateAudio,
};
