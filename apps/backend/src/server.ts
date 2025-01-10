import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { videosRouter } from "./services/videos";
import pinoHttp from "pino-http";
import { errorHandler } from "./error-handler";

const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const httpLogger = pinoHttp({
  logger,
  customProps: (req, res) => ({
    cloudEvent: {
      id: req.headers["ce-id"],
      type: req.headers["ce-type"],
      source: req.headers["ce-source"],
    },
    traceId: req.headers["x-cloud-trace-context"],
  }),
  redact: [
    "req.headers.authorization",
    "req.headers.x-signature",
    "req.headers.x-hub-signature",
    "req.headers.x-webhook-signature",
    "req.body.*.token",
    "req.body.*.password",
    "req.body.*.secret",
    "req.body.*.key",
  ],
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      eventType: req.headers["ce-type"],
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    }),
  },
});

// Middlewares
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Routes
// app.use("/health-check", healthCheckRouter);
app.use("/videos", videosRouter);

// Error handlers
app.use(errorHandler(logger));

export { app, logger };
