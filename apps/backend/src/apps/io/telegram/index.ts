import { Hono } from 'hono';
import { telegramImportHandlerSchema } from 'src/schema/telegram/task-payload';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { importTelegramArchiveHandler } from './routes/import';

/**
 * io Telegram routes — Cloud Task handlers delivered by GCP (OIDC-authenticated
 * at the queue, so no session/webhook middleware here). Mounted at `/telegram`
 * in `io.ts`; the gateway `import` action enqueues to `/telegram/import-handler`.
 */
const telegramRouter = new Hono();

telegramRouter.post(
  '/import-handler',
  honoValidateRequest(telegramImportHandlerSchema),
  honoRequestHandler(importTelegramArchiveHandler),
);

export { telegramRouter };
