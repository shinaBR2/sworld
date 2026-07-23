import type { RequestTelegramLoginCodeRequest } from 'src/schema/telegram/request-login-code';
import { requestLoginCode } from 'src/services/telegram/login';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { toTelegramActionErrorCode } from '../../errors';

// Step 1 of the in-product login: ask Telegram to send a code to the user's own
// device. No dataObject — success just means "code requested" (the response type
// is { success, message }); Telegram delivers the code out-of-band.
const requestTelegramLoginCode = async (
  context: HandlerContext<RequestTelegramLoginCodeRequest>,
) => {
  const logger = getCurrentLogger();
  const { userId } = context.validatedData;

  try {
    await requestLoginCode(userId);
    return AppResponse(true, 'Login code sent');
  } catch (error) {
    const code = toTelegramActionErrorCode(error);
    if (code) {
      return AppError(code);
    }
    logger.error({ error }, '[requestTelegramLoginCode] failed');
    return AppError('Failed to request login code');
  }
};

export { requestTelegramLoginCode };
