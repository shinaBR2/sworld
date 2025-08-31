import express, { type Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { convertHandler } from './routes/convert';
import {
  type ConvertHandlerRequest,
  convertHandlerSchema,
} from 'src/schema/videos/convert';

const videosRouter: Router = express.Router();

videosRouter.post(
  '/convert-handler',
  validateRequest<ConvertHandlerRequest>(convertHandlerSchema),
  convertHandler,
);

export { videosRouter };
