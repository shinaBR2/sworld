import 'dotenv/config';

import { serve } from '@hono/node-server';
import { sentry } from '@hono/sentry';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { contextStorage } from 'hono/context-storage';
// import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { rateLimiter } from 'hono-rate-limiter';
import { authRouter } from './apps/gateway/auth';
import { hashnodeRouter } from './apps/gateway/hashnode';
import { videosRouter } from './apps/gateway/videos';
import { envConfig } from './utils/envConfig';
import { createHonoLoggingMiddleware, getCurrentLogger } from './utils/logger';

const port = Number(envConfig.port) || 4000;

const app = new Hono();
app.use('*', contextStorage());
app.use('*', requestId());
app.use(
  '*',
  createHonoLoggingMiddleware({
    nodeEnv: envConfig.nodeEnv,
  }),
);
app.use(
  '*',
  bodyLimit({
    maxSize: envConfig.server.maxBodyLimitInKBNumber * 1024,
    onError: (c) => {
      return c.json(
        {
          error: 'Request body too large',
        },
        413,
      );
    },
  }),
);
app.use(
  '*',
  sentry({
    dsn: envConfig.sentrydsn,
  }),
);
app.use(
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
    standardHeaders: 'draft-6', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    // TODO: this is important
    keyGenerator: (c) => c.req.header('x-webhook-signature') ?? '', // Method to generate custom identifiers for clients.
    // store: ... , // Redis, MemoryStore, etc. See below.
  }),
);

app.get('/hz', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.route('/videos', videosRouter);
app.route('/hashnode', hashnodeRouter);
app.route('/auth', authRouter);

app.onError((e, c) => {
  const logger = getCurrentLogger();
  logger.error(e);
  // TODO: handle proper response
  return c.json({ error: e.message }, 500);
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server started on port ${info.port}`);
  },
);

export default app;
