import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { ConvertRequest, ConvertSchema } from '../../../services/videos/convert/schema';
import { streamToStorage } from './routes/stream-to-storage';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { WebhookRequest, webhookSchema } from './schema';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';

const videosRouter: Router = express.Router();

// TODO: refactor the ConvertSchema from the old legacy code
videosRouter.post('/convert', validateRequest<ConvertRequest>(ConvertSchema), streamToStorage);
videosRouter.post('/fix-videos-duration', validateRequest<WebhookRequest>(webhookSchema), fixVideosDuration);
videosRouter.post('/fix-videos-thumbnail', validateRequest<WebhookRequest>(webhookSchema), fixVideosThumbnail);

export { videosRouter };
