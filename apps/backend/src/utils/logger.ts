import { pino } from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const httpLogger = pinoHttp({
  logger,
  customProps: (req, res) => ({
    cloudEvent: {
      id: req.headers['ce-id'],
      type: req.headers['ce-type'],
      source: req.headers['ce-source'],
    },
    traceId: req.headers['x-cloud-trace-context'],
  }),
  redact: [
    'req.headers["authorization"]',
    'req.headers["x-signature"]',
    'req.headers["x-hub-signature"]',
    'req.headers["x-webhook-signature"]',
    'req.body.*.token',
    'req.body.*.password',
    'req.body.*.secret',
    'req.body.*.key',
  ],
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      eventType: req.headers['ce-type'],
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }),
  },
});

export { logger, httpLogger };
