import { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { buildVariables, formalize } from './utils';
import { SharePlaylistMutation, SharePlaylistMutationVariables } from '../../../graphql/graphql';

const sharePlaylistMutation = graphql(/* GraphQL */ `
  mutation sharePlaylist($id: uuid!, $emails: jsonb) {
    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {
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

interface UseSharePlaylistProps extends Pick<SharePlaylistMutationOptions, 'onSuccess' | 'onError'> {
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
      onError: (error: unknown, variables: SharePlaylistMutationVariables, context: unknown) => {
        console.error('Share playlist failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useSharePlaylist, formalize, buildVariables };
