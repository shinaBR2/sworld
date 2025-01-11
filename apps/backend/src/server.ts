import express, { type Express } from 'express';
import helmet from 'helmet';
import { videosRouter } from './services/videos';
import { errorHandler } from './utils/error-handler';
import { httpLogger, logger } from './utils/logger';

const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Routes
// app.use("/health-check", healthCheckRouter);
app.use('/videos', videosRouter);

// Error handlers
app.use(errorHandler(logger));

export { app };
