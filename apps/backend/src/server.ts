// import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { videosRouter } from "./services/videos";
import { envConfig } from "./utils/envConfig";
import pinoHttp from "pino-http";

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
  }),
  // Customize which headers to log
  redact: [
    "req.headers.authorization",
    "req.headers.x-signature",
    "req.headers.x-hub-signature",
    "req.headers.x-webhook-signature",
    "req.body.*.token", // Redact any token fields in body
    "req.body.*.password", // Redact any password fields
  ],
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      eventType: req.headers["ce-type"],
    }),
  },
});

app.use(httpLogger);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// TODO
// app.use(rateLimiter);

// Request logging
// app.use(requestLogger);

// Routes
// app.use("/health-check", healthCheckRouter);
// app.use("/users", userRouter);
app.use("/videos", videosRouter);

app.get("/debug-sentry", function mainHandler(req, res) {
  console.log(`dsn`, envConfig.sentrydsn);
  throw new Error("My second Sentry error!");
});

// Swagger UI
// app.use(openAPIRouter);

// Error handlers
// app.use(errorHandler());

export { app, logger };
