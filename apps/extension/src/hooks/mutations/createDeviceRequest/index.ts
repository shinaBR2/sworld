import { useMutationRequest } from 'core/universal/hooks/useMutation';
import { graphql } from '../../../graphql';
import type { CreateDeviceRequestMutation } from '../../../graphql/graphql';

const CREATE_DEVICE_REQUEST = graphql(/* GraphQL */ `
  mutation createDeviceRequest($input: CreateDeviceRequestInput!) {
    createDeviceRequest(input: $input) {
      data {
        userCode
        verificationUri
      }
      error {
        code
        message
      }
      success
    }
  }
`);

const useCreateDeviceRequest = (props: {
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: CreateDeviceRequestMutation) => void;
  onError?: (error: unknown) => void;
}): ReturnType<typeof useMutationRequest>['mutateAsync'] => {
  const { getAccessToken, onSuccess, onError } = props;

  const { mutateAsync } = useMutationRequest({
    // Let TypeScript infer types from the GraphQL document
    document: CREATE_DEVICE_REQUEST,
    getAccessToken,
    options: {
      onSuccess,
      onError,
    },
  });
  return mutateAsync;
};

// export type UseCreateDeviceRequestReturn = ReturnType<
//   typeof useCreateDeviceRequest
// >;
export { useCreateDeviceRequest };
