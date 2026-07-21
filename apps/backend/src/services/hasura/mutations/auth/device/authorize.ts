import { hasuraClient } from 'src/services/hasura/client';

const AUTHORIZE_DEVICE_MUTATION = /* GraphQL */ `
  mutation authorizeDevice(
    $where: device_requests_bool_exp!
    $_set: device_requests_set_input!
  ) {
    update_device_requests(where: $where, _set: $_set) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`;

const authorizeDevice = async ({
  userCode,
  approved,
  userId,
}: {
  userCode: string;
  approved: boolean;
  userId?: string;
}) => {
  const variables = {
    where: {
      userCode: { _eq: userCode },
      status: { _eq: 'pending' },
      expiresAt: { _gt: new Date().toISOString() },
    },
    _set: {
      status: approved ? 'authorized' : 'denied',
      user_id: approved ? userId : null,
      authorizedAt: approved ? new Date().toISOString() : null,
    },
  };

  const response = await hasuraClient.request(
    AUTHORIZE_DEVICE_MUTATION,
    variables,
  );
  return response;
};

export { authorizeDevice };
