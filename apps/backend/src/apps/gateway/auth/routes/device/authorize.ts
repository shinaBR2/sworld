import type { AuthorizeDeviceRequest } from 'src/schema/auth/device/authorize';
import { authorizeDevice as authorizeDeviceMutation } from 'src/services/hasura/mutations/auth/device/authorize';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';

const authorizeDevice = async (
  context: HandlerContext<AuthorizeDeviceRequest>,
) => {
  const { validatedData } = context;
  const { userCode, approved, hasuraUserId } = validatedData;

  if (!hasuraUserId) {
    return AppError('Unauthorized: user ID not found');
  }

  const result = await authorizeDeviceMutation({
    userCode,
    approved,
    userId: hasuraUserId,
  });

  const affectedRows = result?.update_device_requests?.affected_rows ?? 0;

  if (affectedRows === 0) {
    return AppError(
      'Invalid or expired user code. Please check the code and try again.',
    );
  }

  return AppResponse(true, 'ok', { success: true });
};

export { authorizeDevice };
