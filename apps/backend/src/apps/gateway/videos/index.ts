import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { ConvertRequest, ConvertSchema } from '../../../services/videos/convert/schema';
import { crawlHandler } from './routes/crawl';
import { CrawlRequest, CrawlSchema } from './routes/crawl/schema';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';
import { streamToStorage } from './routes/stream-to-storage';
import { WebhookRequest, webhookSchema } from './schema';

const videosRouter: Router = express.Router();

// TODO: refactor the ConvertSchema from the old legacy code
videosRouter.post('/convert', validateRequest<ConvertRequest>(ConvertSchema), streamToStorage);
videosRouter.post('/fix-videos-duration', validateRequest<WebhookRequest>(webhookSchema), fixVideosDuration);
videosRouter.post('/fix-videos-thumbnail', validateRequest<WebhookRequest>(webhookSchema), fixVideosThumbnail);
videosRouter.post('/crawl', validateRequest<CrawlRequest>(CrawlSchema), crawlHandler);

export { videosRouter };
