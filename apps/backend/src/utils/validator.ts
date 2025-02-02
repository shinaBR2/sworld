import type { NextFunction, Request, Response } from 'express';
import { type ZodError, type ZodSchema } from 'zod';
import { ServiceResponse } from './schema';
import { logger } from './logger';

type Header<T extends string> = {
  value: string;
  name: T;
};

interface ValidatedRequest<T> extends Request {
  validatedData: T;
}

type ValidateRequest = <T>(
  schema: ZodSchema<T, any, any>
) => (req: Request, res: Response, next: NextFunction) => void;

const formatZodError = (error: ZodError): string => {
  return error.errors
    .map(err => {
      const path = err.path
        .map(p => {
          // Special handling for common paths
          if (p === 'headers') return 'Header';
          if (typeof p === 'string') return p;
          return `[${p}]`;
        })
        .join(' ');

      // Special handling for required fields
      if (err.message === 'Required') {
        return `${path} is required`;
      }

      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(', ');
};

const validateRequest: ValidateRequest =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Body type:', typeof req.body);
      logger.info('Body keys:', Object.keys(req.body));
      for (const key of Object.keys(req.body)) {
        logger.info(`Key: ${key}`);
        logger.info(`Value type:`, typeof req.body[key]);
        try {
          logger.info(`Value:`, JSON.stringify(req.body[key]));
        } catch (e) {
          logger.info(`Cannot stringify ${key}:`, e);
        }
      }
      const validated = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
      });
      (req as ValidatedRequest<T>).validatedData = validated;

      next();
    } catch (err) {
      const errorMessage = `Invalid input: ${formatZodError(err as ZodError)}`;
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: errorMessage,
        dataObject: null,
      };
      res.status(200).json(serviceResponse);
    }
  };

export { validateRequest, type ValidatedRequest, type Header };
