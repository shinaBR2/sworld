import 'dotenv/config';
import './utils/instrument';
import * as Sentry from '@sentry/node';
import { envConfig } from './utils/envConfig';
import { logger } from './utils/logger';
import { app } from './apps/io';

const port = envConfig.port || 4000;

Sentry.setupExpressErrorHandler(app);

const server = app.listen(port, () => {
  logger.info(`IO service is running on port ${port}`);
});

const onCloseSignal = () => {
  server.close(() => {
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
