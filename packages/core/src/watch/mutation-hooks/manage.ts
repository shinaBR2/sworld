import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../graphql';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const updateVideoMutation = graphql(/* GraphQL */ `
  mutation UpdateVideoManage($id: uuid!, $title: String, $thumbnailUrl: String) {
    update_videos_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title, thumbnailUrl: $thumbnailUrl }
    ) {
      id
    }
  }
`);

const createPlaylistMutation = graphql(/* GraphQL */ `
  mutation CreatePlaylistManage(
    $title: String!
    $slug: String!
    $thumbnailUrl: String
    $description: String
  ) {
    insert_playlist_one(
      object: {
        title: $title
        slug: $slug
        thumbnailUrl: $thumbnailUrl
        description: $description
        site: "watch"
      }
    ) {
      id
    }
  }
`);

const updatePlaylistMutation = graphql(/* GraphQL */ `
  mutation UpdatePlaylistManage($id: uuid!, $title: String, $description: String) {
    update_playlist_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title, description: $description }
    ) {
      id
    }
  }
`);

// ─── useUpdateVideo ───

interface UpdateVideoVariables {
  id: string;
  title?: string;
  thumbnailUrl?: string;
}

interface UseUpdateVideoProps
  extends Pick<
    UseMutationOptions<unknown, unknown, UpdateVideoVariables, unknown>,
    'onSuccess' | 'onError'
  > {
  getAccessToken: () => Promise<string>;
}

const useUpdateVideo = (props: UseUpdateVideoProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: updateVideoMutation,
    getAccessToken,
    options: { onSuccess, onError },
  });
};

// ─── useCreatePlaylist ───

interface CreatePlaylistVariables {
  title: string;
  slug: string;
  thumbnailUrl?: string;
  description?: string;
}

interface UseCreatePlaylistProps
  extends Pick<
    UseMutationOptions<unknown, unknown, CreatePlaylistVariables, unknown>,
    'onSuccess' | 'onError'
  > {
  getAccessToken: () => Promise<string>;
}

const useCreatePlaylist = (props: UseCreatePlaylistProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: createPlaylistMutation,
    getAccessToken,
    options: { onSuccess, onError },
  });
};

// ─── useUpdatePlaylist ───

interface UpdatePlaylistVariables {
  id: string;
  title?: string;
  description?: string;
}

interface UseUpdatePlaylistProps
  extends Pick<
    UseMutationOptions<unknown, unknown, UpdatePlaylistVariables, unknown>,
    'onSuccess' | 'onError'
  > {
  getAccessToken: () => Promise<string>;
}

const useUpdatePlaylist = (props: UseUpdatePlaylistProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: updatePlaylistMutation,
    getAccessToken,
    options: { onSuccess, onError },
  });
};

export { useUpdateVideo, useCreatePlaylist, useUpdatePlaylist };
export type { UpdateVideoVariables, CreatePlaylistVariables, UpdatePlaylistVariables };
