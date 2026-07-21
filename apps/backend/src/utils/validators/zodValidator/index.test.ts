import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { zodValidator } from './index';

describe('zodValidator', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  const buildApp = () => {
    const app = new Hono();
    app.post('/items', zodValidator('json', schema), (c) =>
      c.json({ success: true }),
    );
    return app;
  };

  const postJson = async (app: Hono, body: unknown) =>
    await app.request('/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should pass a valid body through to the handler', async () => {
    const app = buildApp();

    const res = await postJson(app, { name: 'sworld', age: 2 });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('should return the formatted error response for a missing field', async () => {
    const app = buildApp();

    const res = await postJson(app, { name: 'sworld' });

    expect(await res.json()).toEqual({
      success: false,
      message: 'age is required',
      dataObject: null,
    });
  });

  it('should return the formatted error response for a wrong type', async () => {
    const app = buildApp();

    const res = await postJson(app, { name: 42, age: 2 });

    expect(await res.json()).toEqual({
      success: false,
      message: 'name: Expected string, received number',
      dataObject: null,
    });
  });

  it('should pass through the zod message for non-type issues', async () => {
    const app = new Hono();
    app.post('/items', zodValidator('json', z.object({ id: z.guid() })), (c) =>
      c.json({ success: true }),
    );

    const res = await postJson(app, { id: 'not-a-guid' });

    expect(await res.json()).toEqual({
      success: false,
      message: 'id: Invalid GUID',
      dataObject: null,
    });
  });
});
