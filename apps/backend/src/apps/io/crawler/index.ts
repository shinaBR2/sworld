import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { crawlHandler } from './routes/crawl';
import { crawlHandlerSchema, CrawlHandlerRequest } from 'src/schema/videos/crawl';

const crawlerRouter: Router = express.Router();

crawlerRouter.post('/crawl-handler', validateRequest<CrawlHandlerRequest>(crawlHandlerSchema), crawlHandler);

export { crawlerRouter };
