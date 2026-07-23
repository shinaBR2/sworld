import type { SubmitTelegramLoginCodeRequest } from 'src/schema/telegram/submit-login-code';
import { submitLoginCode } from 'src/services/telegram/login';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { toTelegramActionErrorCode } from '../../errors';

// Step 2 of the in-product login: complete sign-in with the code the user
// received. On success the caller's row becomes "ready" (session_string set) and
// the popup switches to the picker. No dataObject — the response is
// { success, message }; a wrong/expired code surfaces as a stable error code.
const submitTelegramLoginCode = async (
  context: HandlerContext<SubmitTelegramLoginCodeRequest>,
) => {
  const logger = getCurrentLogger();
  const { code, userId } = context.validatedData;

  try {
    await submitLoginCode(userId, code);
    return AppResponse(true, 'Logged in');
  } catch (error) {
    const errorCode = toTelegramActionErrorCode(error);
    if (errorCode) {
      return AppError(errorCode);
    }
    logger.error({ error }, '[submitTelegramLoginCode] failed');
    return AppError('Failed to submit login code');
  }
};

export { submitTelegramLoginCode };
