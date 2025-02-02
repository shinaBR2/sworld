import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import {
  StreamHandlerRequest,
  StreamHandlerSchema,
} from './routes/stream-hls/schema';
import { streamHLSHandler } from './routes/stream-hls';
import { importPlatformHandler } from './routes/import-platform';
import {
  ImportHandlerRequest,
  ImportHandlerSchema,
} from './routes/import-platform/schema';

const videosRouter: Router = express.Router();

videosRouter.post(
  '/stream-hls-handler',
  validateRequest<StreamHandlerRequest>(StreamHandlerSchema),
  streamHLSHandler
);
videosRouter.post(
  '/import-platform-handler',
  validateRequest<ImportHandlerRequest>(ImportHandlerSchema),
  importPlatformHandler
);

export { videosRouter };
