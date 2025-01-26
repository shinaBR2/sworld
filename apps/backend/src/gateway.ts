import 'dotenv/config';
import './utils/instrument';
import * as Sentry from '@sentry/node';
import { envConfig } from './utils/envConfig';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { app } from './apps/gateway';

const port = envConfig.port || 4000;

Sentry.setupExpressErrorHandler(app);

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
});

app.use(limiter);

const server = app.listen(port, () => {
  logger.info(`Gateway is running on port ${port}`);
});

const onCloseSignal = () => {
  server.close(() => {
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
