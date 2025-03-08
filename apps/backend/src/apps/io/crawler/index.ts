import express, { Router } from 'express';
import { crawlHandler } from './routes/crawl';

const crawlerRouter: Router = express.Router();

crawlerRouter.post('/crawl-handler', crawlHandler);

export { crawlerRouter };
