import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { postEventsHandler } from './routes/posts';
import { WebhookRequest, webhookSchema } from './schema';

const hashnodeRouter: Router = express.Router();

hashnodeRouter.post('/posts-webhook', validateRequest<WebhookRequest>(webhookSchema), postEventsHandler);

export { hashnodeRouter };
