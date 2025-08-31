import express, { type Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { postEventsHandler } from './routes/posts';
import {
  type HashnodeWebhookRequest,
  hashnodeWebhookSchema,
} from 'src/schema/hashnode';

const hashnodeRouter: Router = express.Router();

hashnodeRouter.post(
  '/posts-webhook',
  validateRequest<HashnodeWebhookRequest>(hashnodeWebhookSchema),
  postEventsHandler,
);

export { hashnodeRouter };
