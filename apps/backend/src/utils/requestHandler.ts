// src/utils/request-handler.ts
import type { Request, Response } from 'express';
import type { Context } from 'hono';
import type { ServiceResponse } from './schema';

// Framework-agnostic handler interface
// Extend Request and Context to include validatedData
type ValidatedRequest<T> = Request & {
  validatedData: T;
};

type ValidatedContext<T> = Context & {
  validatedData: T;
};

interface HandlerContext<T = any> {
  validatedData: T;
}

// Pure business logic handler type
type BusinessHandler<T = any, R = any> = (
  context: HandlerContext<T>,
) => Promise<ServiceResponse<R>>;

// Express wrapper
const expressRequestHandler = <T = any, R = any>(
  handler: BusinessHandler<T, R>,
) => {
  return async (req: Request, res: Response) => {
    const context: HandlerContext<T> = {
      validatedData: (req as ValidatedRequest<T>).validatedData,
    };

    const result = await handler(context);
    res.json(result);
  };
};

// Hono wrapper
const honoRequestHandler = <T = any, R = any>(
  handler: BusinessHandler<T, R>,
) => {
  return async (c: Context) => {
    const context: HandlerContext<T> = {
      validatedData: c.get('validatedData'),
    };

    const result = await handler(context);
    return c.json(result);
  };
};

// Export the appropriate handler based on framework
// You can switch this during migration
const requestHandler = expressRequestHandler; // Start with Express
// const requestHandler = honoRequestHandler // Switch to Hono later

export {
  requestHandler,
  expressRequestHandler,
  honoRequestHandler,
  type BusinessHandler,
  type HandlerContext,
};
