// import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { videosRouter } from "./services/videos";
import { envConfig } from "./utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

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
