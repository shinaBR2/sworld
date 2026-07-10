import type { DeviceRequestCreateRequest } from 'src/schema/auth/device';
import type { CreateDeviceRequestResponse } from 'src/services/hasura/generated-graphql/graphql';
import { createDeviceRequest as createDeviceRequestMutation } from 'src/services/hasura/mutations/auth/device';
import { envConfig } from 'src/utils/envConfig';
import { isValidExtensionId } from 'src/utils/extension';
import { checkRateLimit } from 'src/utils/rateLimit';
import type { HandlerContext } from 'src/utils/requestHandler';
import { generateHumanCode, generateSecureCode } from 'src/utils/string';

const deviceError = (
  code: string,
  message: string,
): CreateDeviceRequestResponse => ({
  success: false,
  error: { code, message },
});

// Mirrors the generated CreateDeviceRequestResponse ({ success, data, error })
// exactly — the generic ServiceResponse/AppResponse envelope
// ({ success, message, dataObject }) doesn't match this action's declared
// GraphQL contract, so Hasura can never resolve `data`.
const createDeviceRequest = async (
  context: HandlerContext<DeviceRequestCreateRequest>,
): Promise<CreateDeviceRequestResponse> => {
  const { validatedData } = context;
  const { ip, userAgent } = validatedData;
  const { extensionId } = validatedData.input.input;

  if (!isValidExtensionId(extensionId)) {
    return deviceError('invalid_client', 'Invalid extension ID');
  }

  try {
    checkRateLimit(ip, extensionId);
  } catch {
    return deviceError(
      'rate_limit_exceeded',
      'Too many device requests. Please try again later.',
    );
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

  return {
    success: true,
    data: {
      deviceCode, // Extension keeps this secret
      userCode, // Show this to user
      verificationUri: `${envConfig.mainSiteUrl}/pair`,
      verificationUriComplete: `${envConfig.mainSiteUrl}/pair?code=${userCode}`,
      expiresIn: 600, // 10 minutes in seconds
      interval: 5, // Poll every 5 seconds
    },
  };
};

export { createDeviceRequest };
