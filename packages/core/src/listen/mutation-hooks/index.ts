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

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

interface CreateListenPlaylistInput {
  title: string;
  slug: string;
  thumbnailUrl: string;
  description?: string;
  public?: boolean;
}

interface PlaylistAudioRef {
  playlistId: string;
  audioId: string;
}

type AddAudioInput = PlaylistAudioRef & { position: number };
type ReorderUpdate = PlaylistAudioRef & { position: number };

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

export {
  type AddAudioInput,
  type CreateListenPlaylistInput,
  type PlaylistAudioRef,
  type ReorderUpdate,
  useAddAudioToPlaylist,
  useCreatePlaylist,
  useRemoveAudioFromPlaylist,
  useReorderPlaylistAudios,
};
