import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  SetVideoThumbnailUrlMutation,
  SetVideoThumbnailUrlMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const setVideoThumbnailUrlMutation = graphql(/* GraphQL */ `
  mutation SetVideoThumbnailUrl($input: SetVideoThumbnailUrlInput!) {
    setVideoThumbnailUrl(input: $input) {
      success
      message
      dataObject {
        thumbnailUrl
      }
    }
  }
`);

type SetVideoThumbnailUrlMutationOptions = UseMutationOptions<
  SetVideoThumbnailUrlMutation,
  unknown,
  SetVideoThumbnailUrlMutationVariables,
  unknown
>;

interface UseSetVideoThumbnailUrlProps
  extends Pick<SetVideoThumbnailUrlMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useSetVideoThumbnailUrl = (props: UseSetVideoThumbnailUrlProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: setVideoThumbnailUrlMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: SetVideoThumbnailUrlMutationVariables,
        context: unknown,
      ) => {
        console.error('Set video thumbnail URL failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useSetVideoThumbnailUrl };
