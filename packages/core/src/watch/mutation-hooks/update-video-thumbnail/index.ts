import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  UpdateVideoThumbnailMutation,
  UpdateVideoThumbnailMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const updateVideoThumbnailMutation = graphql(/* GraphQL */ `
  mutation UpdateVideoThumbnail($id: uuid!, $thumbnailUrl: String!) {
    update_videos_by_pk(pk_columns: { id: $id }, _set: { thumbnailUrl: $thumbnailUrl }) {
      id
      thumbnailUrl
    }
  }
`);

type UpdateVideoThumbnailMutationOptions = UseMutationOptions<
  UpdateVideoThumbnailMutation,
  unknown,
  UpdateVideoThumbnailMutationVariables,
  unknown
>;

interface UseUpdateVideoThumbnailProps
  extends Pick<UpdateVideoThumbnailMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useUpdateVideoThumbnail = (props: UseUpdateVideoThumbnailProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: updateVideoThumbnailMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: UpdateVideoThumbnailMutationVariables,
        context: unknown,
      ) => {
        console.error('Update video thumbnail failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useUpdateVideoThumbnail };
