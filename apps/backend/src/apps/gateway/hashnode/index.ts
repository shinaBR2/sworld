import { Hono } from 'hono';
import { hashnodeWebhookSchema } from 'src/schema/hashnode';
import { requestHandler } from 'src/utils/handlers';
import { zodValidator } from 'src/utils/validators/zodValidator';
import { postEventsHandler } from './routes/posts';

const hashnodeRouter = new Hono();

hashnodeRouter.post(
  '/posts-webhook',
  zodValidator('json', hashnodeWebhookSchema),
  requestHandler(postEventsHandler),
);

export { hashnodeRouter };
