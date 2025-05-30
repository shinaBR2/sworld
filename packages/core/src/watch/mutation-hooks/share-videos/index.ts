import { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import { SharePlaylistMutation, SharePlaylistMutationVariables } from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const shareVideosMutation = graphql(/* GraphQL */ `
  mutation SharePlaylist($objects: [shared_videos_insert_input!]!) {
    insert_shared_videos(objects: $objects) {
      returning {
        id
      }
    }
  }
`);

type ShareVideosMutationOptions = UseMutationOptions<
  SharePlaylistMutation,
  unknown,
  SharePlaylistMutationVariables,
  unknown
>;

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
      onError: (error: unknown, variables: SharePlaylistMutationVariables, context: unknown) => {
        console.error('Share videos failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useShareVideos };
