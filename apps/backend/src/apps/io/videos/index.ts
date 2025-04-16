import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { fixDurationHandler } from './routes/fix-duration';
import { FixDurationHandlerRequest, FixDurationHandlerSchema } from './routes/fix-duration/schema';
import { fixThumbnailHandler } from './routes/fix-thumbnail';
import { FixThumbnailHandlerRequest, FixThumbnailHandlerSchema } from './routes/fix-thumbnail/schema';
import { importPlatformHandler } from './routes/import-platform';
import { ImportHandlerRequest, ImportHandlerSchema } from './routes/import-platform/schema';
import { streamHLSHandler } from './routes/stream-hls';
import { StreamHandlerRequest, StreamHandlerSchema } from './routes/stream-hls/schema';

const videosRouter: Router = express.Router();

videosRouter.post('/stream-hls-handler', validateRequest<StreamHandlerRequest>(StreamHandlerSchema), streamHLSHandler);
videosRouter.post(
  '/import-platform-handler',
  validateRequest<ImportHandlerRequest>(ImportHandlerSchema),
  importPlatformHandler
);
videosRouter.post(
  '/fix-duration',
  validateRequest<FixDurationHandlerRequest>(FixDurationHandlerSchema),
  fixDurationHandler
);
videosRouter.post(
  '/fix-thumbnail',
  validateRequest<FixThumbnailHandlerRequest>(FixThumbnailHandlerSchema),
  fixThumbnailHandler
);

export { videosRouter };
