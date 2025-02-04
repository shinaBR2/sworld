import express, { Router } from 'express';
import { convertHandler } from './routes/convert';
import { validateRequest } from 'src/utils/validator';
import { ConvertHandlerRequest, ConvertHandlerSchema } from './routes/convert/schema';

const videosRouter: Router = express.Router();

videosRouter.post('/convert-handler', validateRequest<ConvertHandlerRequest>(ConvertHandlerSchema), convertHandler);

export { videosRouter };
