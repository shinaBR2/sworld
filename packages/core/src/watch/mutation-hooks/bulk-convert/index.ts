import { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import { InsertVideosMutation, Videos_Insert_Input } from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

interface BulkConvertVariables {
  objects: Array<Videos_Insert_Input>;
}

const bulkConvertMutation = graphql(/* GraphQL */ `
  mutation InsertVideos($objects: [videos_insert_input!]!) {
    insert_videos(objects: $objects) {
      returning {
        id
        title
        description
      }
    }
  }
`);

type BulkConvertMutationOptions = UseMutationOptions<InsertVideosMutation, unknown, BulkConvertVariables, unknown>;

interface UseBulkConvertVideosProps extends Pick<BulkConvertMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

// Example usage
// const { mutate: bulkConvert } = useBulkConvertVideos({
//   getAccessToken: async () => 'your-token-here',
//   onSuccess: (data, variables) => {
//     console.log('Videos converted:', data.insert_videos.returning)
//     console.log('Variables used:', variables)
//   }
// })

const useBulkConvertVideos = (props: UseBulkConvertVideosProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: bulkConvertMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (error: unknown, variables: BulkConvertVariables, context: unknown) => {
        console.error('Bulk convert videos failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useBulkConvertVideos, type BulkConvertVariables };
