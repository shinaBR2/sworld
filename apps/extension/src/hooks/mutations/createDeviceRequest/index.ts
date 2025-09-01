import { useMutationRequest } from 'core/universal/hooks/useMutation';
import { graphql } from '../../../../../../packages/core/src/graphql';

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

const useCreateDeviceRequest = () => {
  const { mutateAsync } = useMutationRequest(CREATE_DEVICE_REQUEST);
  return mutateAsync;
};
