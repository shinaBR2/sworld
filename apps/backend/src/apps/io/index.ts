import { errorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import { createBaseApp } from 'src/utils/base-app';
import { videosRouter } from './videos';
import { crawlerRouter } from './crawler';

const app = createBaseApp();

app.use('/videos', videosRouter);
app.use('/crawlers', crawlerRouter);
app.use(errorHandler(logger));

export { app };
