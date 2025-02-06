import { useMutationRequest } from '../../../universal/hooks/useMutation';

interface Video {
  id: string;
  title: string;
  description: string;
}

interface BulkConvertResponse {
  insert_videos: {
    returning: Video[];
  };
}

interface BulkConvertVariables {
  objects: {
    title: string;
    description: string;
    slug: string;
    video_url: string;
  }[];
}

const bulkConvertMutation = `
  mutation InsertVideos($objects: [videos_insert_input!]!) {
    insert_videos(objects: $objects) {
      returning {
        id
        title
        description
      }
    }
  }
`;

interface UseBulkConvertVideosProps {
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: BulkConvertResponse) => void;
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

  return useMutationRequest<BulkConvertResponse, BulkConvertVariables>({
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

export { useBulkConvertVideos, type BulkConvertResponse, type BulkConvertVariables };
