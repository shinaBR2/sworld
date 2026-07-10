// src/utils/request-handler.ts
import type { Context } from 'hono';
import type { ServiceResponse } from './schema';

interface HandlerContext<T = any> {
  validatedData: T;
}

// Shared shape: a pure business-logic function taking validated input and
// resolving some response R.
type Handler<T = any, R = any> = (context: HandlerContext<T>) => Promise<R>;

// A handler returning the generic ServiceResponse envelope
type BusinessHandler<T = any, R = any> = Handler<T, ServiceResponse<R>>;

// Pull validatedData off context, run the handler, serialize its result.
// honoRequestHandler below narrows this to the ServiceResponse envelope;
// exported directly as honoActionHandler for a handler backing a Hasura
// Action with its own declared response contract (e.g. { success, data,
// error }) instead — Handler<T, R> already carries no constraint beyond
// that, so no separate wrapper is needed.
const wrapHandler = <T, R>(handler: Handler<T, R>) => {
  return async (c: Context) => {
    const context: HandlerContext<T> = {
      validatedData: c.get('validatedData'),
    };

    const result = await handler(context);
    return c.json(result);
  };
};

// Hono wrapper
const honoRequestHandler = <T = any, R = any>(handler: BusinessHandler<T, R>) =>
  wrapHandler(handler);

export {
  honoRequestHandler,
  wrapHandler as honoActionHandler,
  type BusinessHandler,
  type Handler,
  type HandlerContext,
};
