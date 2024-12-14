// import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

// TODO
// import { env } from "@/common/utils/envConfig";

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

// Swagger UI
// app.use(openAPIRouter);

// Error handlers
// app.use(errorHandler());

export { app, logger };
