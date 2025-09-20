// TODO: remove this
import { createBaseApp } from '../../utils/base-app';
import { errorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import { authRouter } from './auth';
import { hashnodeRouter } from './hashnode';
import { videosRouter } from './videos';

const app = createBaseApp();

// Set the application to trust the reverse proxy
app.set('trust proxy', 1);

// Routes
// app.use("/health-check", healthCheckRouter);
app.use('/videos', videosRouter);
app.use('/hashnode', hashnodeRouter);
app.use('/auth', authRouter);

// Error handlers
app.use(errorHandler(logger));

export { app };
