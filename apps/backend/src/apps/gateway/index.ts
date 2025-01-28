import { errorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import { videosRouter } from './videos';
import { createBaseApp } from '../../utils/base-app';

const app = createBaseApp();

// Set the application to trust the reverse proxy
app.set('trust proxy', 1);

// Routes
// app.use("/health-check", healthCheckRouter);
app.use('/videos', videosRouter);

// Error handlers
app.use(errorHandler(logger));

export { app };
