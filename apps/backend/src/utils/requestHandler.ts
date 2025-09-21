// src/utils/request-handler.ts
import type { Context } from 'hono';
import type { ServiceResponse } from './schema';

interface HandlerContext<T = any> {
  validatedData: T;
}

// Pure business logic handler type
type BusinessHandler<T = any, R = any> = (
  context: HandlerContext<T>,
) => Promise<ServiceResponse<R>>;

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

export { honoRequestHandler, type BusinessHandler, type HandlerContext };
