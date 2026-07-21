import type { GetDeviceTokenRequest } from 'src/schema/auth/device/token';
import { getDeviceToken as getDeviceTokenQuery } from 'src/services/hasura/mutations/auth/device/token';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';

const getDeviceToken = async (
  context: HandlerContext<GetDeviceTokenRequest>,
) => {
  const { validatedData } = context;
  const { deviceCode, grantType } = validatedData;

  if (grantType !== 'urn:ietf:params:oauth:grant-type:device_code') {
    return AppError('unsupported_grant_type');
  }

  const deviceRequest = await getDeviceTokenQuery(deviceCode);

  if (!deviceRequest) {
    return AppError('invalid_grant');
  }

  const now = new Date();
  const expiresAt = new Date(deviceRequest.expiresAt);

  if (expiresAt < now) {
    return AppError('expired_token');
  }

  switch (deviceRequest.status) {
    case 'pending':
      return AppResponse(true, 'authorization_pending', null);

    case 'denied':
      return AppError('access_denied');

    case 'expired':
      return AppError('expired_token');

    case 'authorized':
      return AppResponse(true, 'ok', {
        accessToken: '',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });

    default:
      return AppError('invalid_state');
  }
};

export { getDeviceToken };
