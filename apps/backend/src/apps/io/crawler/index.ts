import express, { Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { crawlHandler } from './routes/crawl';
import { CrawlHandlerInput, crawlHandlerSchema } from './routes/crawl/schema';

const crawlerRouter: Router = express.Router();

crawlerRouter.post('/crawl-handler', validateRequest<CrawlHandlerInput>(crawlHandlerSchema), crawlHandler);

export { crawlerRouter };
