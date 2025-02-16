import * as Sentry from '@sentry/node';
import { ErrorRequestHandler } from 'express';
import { Logger } from 'pino';
import { CustomError } from './custom-error';

const cleanStack = (stack?: string) => {
  if (!stack) return undefined;

  return stack
    .split('\n')
    .filter(line => !line.includes('node_modules'))
    .join('\n');
};

const reportError = (err: unknown) => {
  if (err instanceof CustomError) {
    Sentry.withScope(scope => {
      scope.setTags({
        errorCode: err.errorCode,
        severity: err.severity,
      });

      // Add error context as extra data
      if (err.contexts?.length > 0) {
        err.contexts.forEach(context => {
          scope.setExtra(context.source, context.data);
        });
      }

      // Add original error if exists
      if (err.originalError) {
        scope.setExtra('originalError', {
          message: err.originalError.message,
          name: err.originalError.name,
          stack: err.originalError.stack,
        });
      }

      Sentry.captureException(err);
    });
  } else {
    // For native errors, just capture with basic info
    Sentry.withScope(scope => {
      scope.setLevel('error');
      scope.setTag('type', 'native_error');
      Sentry.captureException(err);
    });
  }
};

export const errorHandler = (logger: Logger): ErrorRequestHandler => {
  // next is required for nextjs
  return (err, req, res, next) => {
    reportError(err);

    logger.error({
      req: {
        method: req.method,
        url: req.url,
      },
      stack: cleanStack(err.stack),
    });
    const statusCode = err instanceof CustomError && err.shouldRetry ? 500 : 200;

    return res.status(statusCode).json({
      error: 'Internal Server Error',
    });
  };
};
