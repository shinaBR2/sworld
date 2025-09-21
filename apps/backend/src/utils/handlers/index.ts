/** biome-ignore-all lint/suspicious/noExplicitAny: fuck it */
import type { Context } from 'hono';

/**
 * TODO: remove this,
 * use honoRequestHandler
 * IMPORTANT!
 * This requires zodValidator
 */
const requestHandler = <T = any, R = any>(
  handler: (data: T) => Promise<R> | R,
) => {
  return async (c: Context) => {
    // biome-ignore lint/suspicious/noTsIgnore: fuck it
    // @ts-ignore
    const data = c.req.valid('json');

    const result = await handler(data);
    return c.json(result);
  };
};

/**
 * TODO: remove this
 * use honoRequestHandler
 */
const pureRequestHandler = <T = any, R = any>(
  handler: (data: T) => Promise<R> | R,
) => {
  return async (c: Context) => {
    const data = await c.req.json();

    const result = await handler(data);
    return c.json(result);
  };
};

export { requestHandler, pureRequestHandler };
