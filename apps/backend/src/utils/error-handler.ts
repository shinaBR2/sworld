import { ErrorRequestHandler } from 'express';
import { Logger } from 'pino';

export const errorHandler = (logger: Logger): ErrorRequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production';

  return (err, req, res, next) => {
    logger.error({
      err,
      req: {
        method: req.method,
        url: req.url,
        eventType: req.headers['ce-type'],
      },
      // Include stack in non-production
      stack: isProduction ? undefined : err.stack,
    });

    res.status(200).json({
      error: isProduction ? 'Internal Server Error' : err.message,
    });
  };
};
