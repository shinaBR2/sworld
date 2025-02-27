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

interface UseBulkConvertVideosProps {
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: InsertVideosMutation) => void;
  onError?: (error: unknown) => void;
}

// Example usage
// const { mutate: bulkConvert } = useBulkConvertVideos({
//   getAccessToken: async () => 'your-token-here',
//   onSuccess: (data) => {
//     console.log('Videos converted:', data.insert_videos.returning)
//   }
// })

const useBulkConvertVideos = (props: UseBulkConvertVideosProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest<InsertVideosMutation, BulkConvertVariables>({
    document: bulkConvertMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: error => {
        console.error('Bulk convert videos failed:', error);
        onError?.(error);
      },
    },
  });
};

export { useBulkConvertVideos, type BulkConvertVariables };
