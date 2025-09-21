import { Hono } from 'hono';
import { convertHandlerSchema } from 'src/schema/videos/convert';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { convertHandler } from './routes/convert';

const videosRouter = new Hono();

videosRouter.post(
  '/convert-handler',
  honoValidateRequest(convertHandlerSchema),
  honoRequestHandler(convertHandler),
);

export { videosRouter };
