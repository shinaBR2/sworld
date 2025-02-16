import * as Sentry from '@sentry/node';
import { ErrorRequestHandler } from 'express';
import { Logger } from 'pino';
import { CustomError } from './custom-error';

export const errorHandler = (logger: Logger): ErrorRequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cleanStack = (stack?: string) => {
    if (!stack) return undefined;

    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .join('\n');
  };

  // next is required for nextjs
  return (err, req, res, next) => {
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

    logger.error({
      req: {
        method: req.method,
        url: req.url,
      },
      // Include stack in non-production
      stack: isProduction ? undefined : cleanStack(err.stack),
    });

    // TODO
    // Handle retry from error
    return res.status(200).json({
      error: isProduction ? 'Internal Server Error' : err.message,
    });
  };
};
