import type { DeviceRequestCreateRequest } from 'src/schema/auth/device';
import { createDeviceRequest as createDeviceRequestMutation } from 'src/services/hasura/mutations/auth/device';
import { envConfig } from 'src/utils/envConfig';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';
import { generateHumanCode, generateSecureCode } from 'src/utils/string';

const createDeviceRequest = async (
  context: HandlerContext<DeviceRequestCreateRequest>,
) => {
  const { validatedData } = context;
  const { ip, userAgent } = validatedData;
  const { extensionId } = validatedData.input.input;

  // Validate extension ID
  // if (!isValidExtensionId(extensionId)) {
  //   return res.status(400).json({ error: 'invalid_client' });
  // }

  // // Rate limiting
  // await checkRateLimit(req.ip, extensionId);

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
