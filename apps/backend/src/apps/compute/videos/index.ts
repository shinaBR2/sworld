import express, { Router } from 'express';
import { convertHandler } from './routes/convert';

const videosRouter: Router = express.Router();

videosRouter.post('/convert-handler', convertHandler);

export { videosRouter };
