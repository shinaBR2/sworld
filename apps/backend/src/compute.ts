import { serve } from '@hono/node-server';
import { sentry } from '@hono/sentry';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { rateLimiter } from 'hono-rate-limiter';
import { envConfig } from 'src/utils/envConfig';
import {
  createHonoLoggingMiddleware,
  getCurrentLogger,
} from 'src/utils/logger';
import { videosRouter } from './apps/compute/videos';

const port = Number(envConfig.port) || 4000;

const app = new Hono();

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
