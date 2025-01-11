import type { NextFunction, Request, Response } from 'express';
import { type ZodError, type ZodSchema } from 'zod';
import { ServiceResponse } from './schema';

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

const validateRequest: ValidateRequest =
  <T>(schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
      });
      (req as ValidatedRequest<T>).validatedData = validated as T;
      next();
    } catch (err) {
      const errorMessage = `Invalid input: ${(err as ZodError).errors
        .map(e => e.message)
        .join(', ')}`;
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: errorMessage,
        dataObject: null,
      };
      res.status(200).json(serviceResponse);
    }
  };

export { validateRequest, type ValidatedRequest, type Header };
