import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { ConvertRequest, ConvertSchema } from '../../../services/videos/convert/schema';
import { streamToStorage } from './routes/stream-to-storage';

const videosRouter: Router = express.Router();

videosRouter.post('/convert', validateRequest<ConvertRequest>(ConvertSchema), streamToStorage);

export { videosRouter };
