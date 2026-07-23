import { Hono } from 'hono';
import { importTelegramArchiveSchema } from 'src/schema/telegram/import';
import { listTelegramChannelVideosSchema } from 'src/schema/telegram/list';
import { requestTelegramLoginCodeSchema } from 'src/schema/telegram/request-login-code';
import { submitTelegramLoginCodeSchema } from 'src/schema/telegram/submit-login-code';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { importTelegramArchive } from './routes/import';
import { listTelegramChannelVideos } from './routes/list';
import { requestTelegramLoginCode } from './routes/request-login-code';
import { submitTelegramLoginCode } from './routes/submit-login-code';

/**
 * Telegram MTProto Actions — session-authenticated (`x-hasura-user-id`), not
 * webhook-signature-authenticated, same split as `videos-actions`/`storage`.
 * Every route resolves a PER-USER client (SWO-491) from the caller's own
 * credentials; `userId` is always read from `session_variables`, never the body.
 *
 * curl -X POST 'http://localhost:4000/telegram-actions/list' \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "action": { "name": "listTelegramChannelVideos" },
 *     "input": { "input": { "channelId": "-582839764" } },
 *     "session_variables": { "x-hasura-user-id": "550e8400-e29b-41d4-a716-446655440001" }
 *   }'
 */
const telegramActionsRouter = new Hono();

telegramActionsRouter.post(
  '/list',
  honoValidateRequest(listTelegramChannelVideosSchema),
  honoRequestHandler(listTelegramChannelVideos),
);

telegramActionsRouter.post(
  '/import',
  honoValidateRequest(importTelegramArchiveSchema),
  honoRequestHandler(importTelegramArchive),
);

telegramActionsRouter.post(
  '/request-login-code',
  honoValidateRequest(requestTelegramLoginCodeSchema),
  honoRequestHandler(requestTelegramLoginCode),
);

telegramActionsRouter.post(
  '/submit-login-code',
  honoValidateRequest(submitTelegramLoginCodeSchema),
  honoRequestHandler(submitTelegramLoginCode),
);

export { telegramActionsRouter };
