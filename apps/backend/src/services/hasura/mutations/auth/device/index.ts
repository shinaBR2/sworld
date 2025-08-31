import { hasuraClient } from 'src/services/hasura/client';
import { graphql } from '../../../generated-graphql';
import type {
  CreateDeviceRequestMutation,
  CreateDeviceRequestMutationVariables,
  Device_Requests_Insert_Input,
} from '../../../generated-graphql/graphql';

const CREATE_DEVICE_REQUEST_MUTATION = graphql(/* GraphQL */ `
  mutation createDeviceRequest($object: device_requests_insert_input!) {
    insert_device_requests_one(object: $object) {
      id
      deviceCode
      userCode
    }
  }
`);

const createDeviceRequest = async (variables: Device_Requests_Insert_Input) => {
  console.log(`DEBUG variables: ${JSON.stringify(variables)}`);

  const response = await hasuraClient.request<
    CreateDeviceRequestMutation,
    CreateDeviceRequestMutationVariables
  >({
    document: CREATE_DEVICE_REQUEST_MUTATION.toString(),
    variables: {
      object: variables,
    },
  });

  if (!response.insert_device_requests_one) {
    throw new Error('Failed to create device request');
  }

  return response.insert_device_requests_one;
};

export { createDeviceRequest };
