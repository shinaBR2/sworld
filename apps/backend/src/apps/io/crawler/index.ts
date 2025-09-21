import { Hono } from 'hono';
import { crawlHandlerSchema } from 'src/schema/videos/crawl';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { crawlHandler } from './routes/crawl';

const crawlerRouter = new Hono();

crawlerRouter.post(
  '/crawl-handler',
  honoValidateRequest(crawlHandlerSchema),
  honoRequestHandler(crawlHandler),
);

export { crawlerRouter };
