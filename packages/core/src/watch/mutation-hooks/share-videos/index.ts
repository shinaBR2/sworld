import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  SharePlaylistMutation,
  SharePlaylistMutationVariables,
  ShareVideoMutation,
  ShareVideoMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { buildVariables, formalize } from './utils';

const sharePlaylistMutation = graphql(/* GraphQL */ `
  mutation sharePlaylist($id: uuid!, $emails: jsonb) {
    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {
      id
    }
  }
`);

const shareVideoMutation = graphql(/* GraphQL */ `
  mutation shareVideo($id: uuid!, $emails: jsonb) {
    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {
      id
    }
  }
`);

type SharePlaylistMutationOptions = UseMutationOptions<
  SharePlaylistMutation,
  unknown,
  SharePlaylistMutationVariables,
  unknown
>;

type ShareVideoMutationOptions = UseMutationOptions<
  ShareVideoMutation,
  unknown,
  ShareVideoMutationVariables,
  unknown
>;

interface UseSharePlaylistProps
  extends Pick<SharePlaylistMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

interface UseShareVideoProps
  extends Pick<ShareVideoMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

// Example usage
// const { mutate: shareVideos } = useSharePlaylist({
//   getAccessToken: async () => 'your-token-here',
//   onSuccess: (data, variables) => {
//     console.log('Videos shared:', data.insert_shared_videos.returning)
//     console.log('Variables used:', variables)
//   }
// })

const useSharePlaylist = (props: UseSharePlaylistProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: sharePlaylistMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: SharePlaylistMutationVariables,
        context: unknown,
      ) => {
        console.error('Share playlist failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

const useShareVideo = (props: UseShareVideoProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: shareVideoMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: ShareVideoMutationVariables,
        context: unknown,
      ) => {
        console.error('Share video failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useSharePlaylist, useShareVideo, formalize, buildVariables };
