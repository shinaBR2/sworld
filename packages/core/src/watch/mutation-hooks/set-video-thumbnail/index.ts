import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  SetVideoThumbnailAtTimeMutation,
  SetVideoThumbnailAtTimeMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const setVideoThumbnailAtTimeMutation = graphql(/* GraphQL */ `
  mutation SetVideoThumbnailAtTime($input: SetVideoThumbnailAtTimeInput!) {
    setVideoThumbnailAtTime(input: $input) {
      success
      message
      dataObject {
        thumbnailUrl
      }
    }
  }
`);

type SetVideoThumbnailMutationOptions = UseMutationOptions<
  SetVideoThumbnailAtTimeMutation,
  unknown,
  SetVideoThumbnailAtTimeMutationVariables,
  unknown
>;

interface UseSetVideoThumbnailProps
  extends Pick<SetVideoThumbnailMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useSetVideoThumbnail = (props: UseSetVideoThumbnailProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: setVideoThumbnailAtTimeMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: SetVideoThumbnailAtTimeMutationVariables,
        context: unknown,
      ) => {
        console.error('Set video thumbnail failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useSetVideoThumbnail };
