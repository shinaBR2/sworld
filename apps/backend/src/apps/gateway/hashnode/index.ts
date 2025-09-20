import { Hono } from 'hono';
import { hashnodeBodySchema, hashnodeHeadersSchema } from 'src/schema/hashnode';
import { requestHandler } from 'src/utils/handlers';
import { validateHashnodeSignature } from 'src/utils/validators/validateHashnodeSignature';
import { validateHeaders } from 'src/utils/validators/validateHeaders';
import { zodValidator } from 'src/utils/validators/zodValidator';
import { postEventsHandler } from './routes/posts';

const hashnodeRouter = new Hono();

hashnodeRouter.post(
  '/posts-webhook',
  validateHeaders(hashnodeHeadersSchema),
  validateHashnodeSignature(),
  zodValidator('json', hashnodeBodySchema),
  requestHandler(postEventsHandler),
);

export { hashnodeRouter };
