import { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';
import { buildVariables, formalize } from './utils';
import { ShareVideoMutation, ShareVideoMutationVariables } from '../../../graphql/graphql';

const shareVideosMutation = graphql(/* GraphQL */ `
  mutation shareVideo($id: uuid!, $emails: jsonb) {
    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {
      id
    }
  }
`);

type ShareVideosMutationOptions = UseMutationOptions<ShareVideoMutation, unknown, ShareVideoMutationVariables, unknown>;

interface UseShareVideosProps extends Pick<ShareVideosMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

// Example usage
// const { mutate: shareVideos } = useShareVideos({
//   getAccessToken: async () => 'your-token-here',
//   onSuccess: (data, variables) => {
//     console.log('Videos shared:', data.insert_shared_videos.returning)
//     console.log('Variables used:', variables)
//   }
// })

const useShareVideos = (props: UseShareVideosProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: shareVideosMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (error: unknown, variables: ShareVideoMutationVariables, context: unknown) => {
        console.error('Share videos failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useShareVideos, formalize, buildVariables };
