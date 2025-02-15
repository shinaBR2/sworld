import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { ConvertRequest, ConvertSchema } from '../../../services/videos/convert/schema';
import { streamToStorage } from './routes/stream-to-storage';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { FixVideosDurationRequest, fixVideosDurationSchema } from './routes/fix-videos-duration/schema';

const videosRouter: Router = express.Router();

// TODO: refactor the ConvertSchema from the old legacy code
videosRouter.post('/convert', validateRequest<ConvertRequest>(ConvertSchema), streamToStorage);
videosRouter.post(
  '/fix-videos-duration',
  validateRequest<FixVideosDurationRequest>(fixVideosDurationSchema),
  fixVideosDuration
);

export { videosRouter };
