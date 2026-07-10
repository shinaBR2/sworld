import type { DeviceRequestCreateRequest } from 'src/schema/auth/device';
import { createDeviceRequest as createDeviceRequestMutation } from 'src/services/hasura/mutations/auth/device';
import { envConfig } from 'src/utils/envConfig';
import { isValidExtensionId } from 'src/utils/extension';
import { checkRateLimit } from 'src/utils/rateLimit';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { generateHumanCode, generateSecureCode } from 'src/utils/string';

const createDeviceRequest = async (
  context: HandlerContext<DeviceRequestCreateRequest>,
) => {
  const { validatedData } = context;
  const { ip, userAgent } = validatedData;
  const { extensionId } = validatedData.input.input;

  if (!isValidExtensionId(extensionId)) {
    return AppError('invalid_client');
  }

  try {
    checkRateLimit(ip, extensionId);
  } catch {
    return AppError('rate_limit_exceeded');
  }

  // Generate codes
  const deviceCode = generateSecureCode(64); // Long, cryptographic
  const userCode = generateHumanCode(); // Short, readable
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in database
  await createDeviceRequestMutation({
    deviceCode,
    userCode,
    extensionId,
    expiresAt,
    ipAddress: ip,
    userAgent,
    status: 'pending',
  });

  return AppResponse(true, 'ok', {
    deviceCode, // Extension keeps this secret
    userCode, // Show this to user
    verification_uri: `${envConfig.mainSiteUrl}/pair`,
    verification_uri_complete: `${envConfig.mainSiteUrl}/pair?code=${userCode}`,
    expires_in: 600, // 10 minutes in seconds
    interval: 5, // Poll every 5 seconds
  });
};

export { createDeviceRequest };
