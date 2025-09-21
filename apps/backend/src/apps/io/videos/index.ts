import { Hono } from 'hono';
import { fixDurationHandlerSchema } from 'src/schema/videos/fix-duration';
import { fixThumbnailHandlerSchema } from 'src/schema/videos/fix-thumbnail';
import { importHandlerSchema } from 'src/schema/videos/import-platform';
import { streamHandlerSchema } from 'src/schema/videos/stream-hls';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { fixDurationHandler } from './routes/fix-duration';
import { fixThumbnailHandler } from './routes/fix-thumbnail';
import { importPlatformHandler } from './routes/import-platform';
import { streamHLSHandler } from './routes/stream-hls';

const videosRouter = new Hono();

videosRouter.post(
  '/stream-hls-handler',
  honoValidateRequest(streamHandlerSchema),
  honoRequestHandler(streamHLSHandler),
);
videosRouter.post(
  '/import-platform-handler',
  honoValidateRequest(importHandlerSchema),
  honoRequestHandler(importPlatformHandler),
);
videosRouter.post(
  '/fix-duration',
  honoValidateRequest(fixDurationHandlerSchema),
  honoRequestHandler(fixDurationHandler),
);
videosRouter.post(
  '/fix-thumbnail',
  honoValidateRequest(fixThumbnailHandlerSchema),
  honoRequestHandler(fixThumbnailHandler),
);

export { videosRouter };
