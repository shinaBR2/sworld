import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { convertHandler } from './routes/convert';
import { ConvertHandlerRequest, ConvertHandlerSchema } from './routes/convert/schema';

const videosRouter: Router = express.Router();

videosRouter.post('/convert-handler', validateRequest<ConvertHandlerRequest>(ConvertHandlerSchema), convertHandler);

export { videosRouter };
