import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  CreateSignedUploadUrlMutation,
  CreateSignedUploadUrlMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const createSignedUploadUrlMutation = graphql(/* GraphQL */ `
  mutation CreateSignedUploadUrl($input: SignedUploadUrlInput!) {
    createSignedUploadUrl(input: $input) {
      success
      message
      dataObject {
        uploadUrl
        publicUrl
        objectPath
        expiresAt
      }
    }
  }
`);

type CreateSignedUploadUrlMutationOptions = UseMutationOptions<
  CreateSignedUploadUrlMutation,
  unknown,
  CreateSignedUploadUrlMutationVariables,
  unknown
>;

interface UseCreateSignedUploadUrlProps
  extends Pick<CreateSignedUploadUrlMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useCreateSignedUploadUrl = (props: UseCreateSignedUploadUrlProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: createSignedUploadUrlMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: CreateSignedUploadUrlMutationVariables,
        context: unknown,
      ) => {
        console.error('Create signed upload URL failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useCreateSignedUploadUrl };
