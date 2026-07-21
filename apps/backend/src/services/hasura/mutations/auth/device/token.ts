import { hasuraClient } from 'src/services/hasura/client';

const GET_DEVICE_TOKEN_QUERY = /* GraphQL */ `
  query getDeviceToken($deviceCode: String!) {
    device_requests(
      where: { deviceCode: { _eq: $deviceCode } }
      limit: 1
    ) {
      id
      status
      user_id
      extensionId
      expiresAt
    }
  }
`;

const getDeviceToken = async (deviceCode: string) => {
  const response = await hasuraClient.request(GET_DEVICE_TOKEN_QUERY, {
    deviceCode,
  });
  return response.device_requests?.[0] ?? null;
};

export { getDeviceToken };
