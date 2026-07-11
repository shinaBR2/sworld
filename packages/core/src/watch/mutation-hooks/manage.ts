import { useQueryClient } from '@tanstack/react-query';
import { graphql } from '../../graphql';
import type { WatchManageQuery } from '../../graphql/graphql';
import { useMutationRequest } from '../../universal/hooks/useMutation';

const MANAGE_KEY = ['watch-manage'];

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

interface UseMutationProps {
  getAccessToken: () => Promise<string>;
}

const useUpdateVideo = (props: UseMutationProps) => {
  const { getAccessToken } = props;
  const queryClient = useQueryClient();

  return useMutationRequest({
    document: updateVideoMutation,
    getAccessToken,
    options: {
      onMutate: async (rawVars: unknown) => {
        const variables = rawVars as UpdateVideoVariables;
        await queryClient.cancelQueries({ queryKey: MANAGE_KEY });
        const previous = queryClient.getQueryData<WatchManageQuery>(MANAGE_KEY);
        if (previous) {
          queryClient.setQueryData<WatchManageQuery>(MANAGE_KEY, {
            ...previous,
            videos: previous.videos?.map((v) =>
              v.id === variables.id
                ? {
                    ...v,
                    ...(variables.title !== undefined && {
                      title: variables.title,
                    }),
                    ...(variables.thumbnailUrl !== undefined && {
                      thumbnailUrl: variables.thumbnailUrl,
                    }),
                  }
                : v,
            ),
          });
        }
        return { previous };
      },
      onError: (_error: unknown, _variables: unknown, context: unknown) => {
        const ctx = context as { previous?: WatchManageQuery } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(MANAGE_KEY, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: MANAGE_KEY });
      },
    } as any,
  });
};

// ─── useCreatePlaylist ───

interface CreatePlaylistVariables {
  title: string;
  slug: string;
  thumbnailUrl?: string;
  description?: string;
}

const useCreatePlaylist = (props: UseMutationProps) => {
  const { getAccessToken } = props;
  const queryClient = useQueryClient();

  return useMutationRequest({
    document: createPlaylistMutation,
    getAccessToken,
    options: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: MANAGE_KEY });
      },
    } as any,
  });
};

// ─── useUpdatePlaylist ───

interface UpdatePlaylistVariables {
  id: string;
  title?: string;
  description?: string;
}

const useUpdatePlaylist = (props: UseMutationProps) => {
  const { getAccessToken } = props;
  const queryClient = useQueryClient();

  return useMutationRequest({
    document: updatePlaylistMutation,
    getAccessToken,
    options: {
      onMutate: async (rawVars: unknown) => {
        const variables = rawVars as UpdatePlaylistVariables;
        await queryClient.cancelQueries({ queryKey: MANAGE_KEY });
        const previous = queryClient.getQueryData<WatchManageQuery>(MANAGE_KEY);
        if (previous) {
          queryClient.setQueryData<WatchManageQuery>(MANAGE_KEY, {
            ...previous,
            playlist: previous.playlist?.map((p) =>
              p.id === variables.id
                ? {
                    ...p,
                    ...(variables.title !== undefined && {
                      title: variables.title,
                    }),
                    ...(variables.description !== undefined && {
                      description: variables.description,
                    }),
                  }
                : p,
            ),
          });
        }
        return { previous };
      },
      onError: (_error: unknown, _variables: unknown, context: unknown) => {
        const ctx = context as { previous?: WatchManageQuery } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(MANAGE_KEY, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: MANAGE_KEY });
      },
    } as any,
  });
};

export { useUpdateVideo, useCreatePlaylist, useUpdatePlaylist };
export type {
  UpdateVideoVariables,
  CreatePlaylistVariables,
  UpdatePlaylistVariables,
};
