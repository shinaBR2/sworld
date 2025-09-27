import { AsyncLocalStorage } from 'node:async_hooks';
import { type Logger, pino } from 'pino';
import pinoHttp from 'pino-http';

interface EnvConfig {
  nodeEnv: string;
}

const loggerStorage = new AsyncLocalStorage<Logger>();
// Check where use this
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const createBaseConfig = (envConfig: EnvConfig) => ({
  level: envConfig.nodeEnv === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label: string) => ({ level: label }),
    // biome-ignore lint/suspicious/noExplicitAny: no-need
    log: (object: any) => {
      // Sanitize sensitive data
      const sanitized = { ...object };
      const sensitiveKeys = [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        'bearer',
        'jwt',
      ];

      sensitiveKeys.forEach((key) => {
        if (sanitized[key]) {
          sanitized[key] = '[REDACTED]';
        }
      });

      return sanitized;
    },
  },
});

const getBaseLogger = (envConfig: EnvConfig) => {
  const baseConfig = createBaseConfig(envConfig);

  if (envConfig.nodeEnv === 'production') {
    return pino(baseConfig);
  } else {
    // Development: pretty printing with fallback to JSON if pino-pretty fails
    try {
      return pino({
        ...baseConfig,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,requestId',
            messageFormat: '[{requestId}] {msg}',
          },
        },
      });
    } catch (_error) {
      // Fallback to JSON if pretty printing fails
      return pino(baseConfig);
    }
  }
};

const createLogger = (requestId?: string, envConfig?: EnvConfig) => {
  // Default envConfig if not provided (for backward compatibility)
  const config = envConfig || { nodeEnv: 'development' };
  const baseLogger = getBaseLogger(config);

  if (requestId) {
    return baseLogger.child({ requestId });
  }

  return baseLogger;
};

const getCurrentLogger = (): Logger => {
  const requestLogger = loggerStorage.getStore();

  if (requestLogger) {
    return requestLogger;
  }

  // If no request context, return global logger
  // This happens when called outside of Hono request context
  return logger;
};

/**
 * This only used for Hono
 */
const createHonoLoggingMiddleware = (envConfig: EnvConfig) => {
  return async (c: any, next: any) => {
    const requestId = c.var.requestId;

    // Create ONE logger instance with our custom configuration
    const logger = createLogger(requestId, envConfig);

    // Use it for pinoHttp with HTTP-specific options
    const pinoMiddleware = pinoHttp({
      logger,
    });

    // Execute pinoHttp middleware
    await new Promise<void>((resolve) =>
      pinoMiddleware(c.env.incoming, c.env.outgoing, () => resolve()),
    );

    // Use the SAME instance for AsyncLocalStorage
    return loggerStorage.run(logger, async () => {
      await next();
    });
  };
};

const httpLogger = pinoHttp({
  logger: getCurrentLogger(),
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

export { logger, httpLogger, createHonoLoggingMiddleware, getCurrentLogger };
