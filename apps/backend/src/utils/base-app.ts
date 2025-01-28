import express, { type Express } from 'express';
import { httpLogger } from './logger';
import helmet from 'helmet';

const createBaseApp = () => {
  const app: Express = express();

  // Middlewares
  app.use(httpLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  return app;
};

export { createBaseApp };
