import express, { Router } from 'express';
import { streamHLSHandler } from './routes/stream-hls';
import { importPlatformHandler } from './routes/import-platform';

const videosRouter: Router = express.Router();

videosRouter.post('/stream-hls-handler', streamHLSHandler);
videosRouter.post('/import-platform-handler', importPlatformHandler);

export { videosRouter };
