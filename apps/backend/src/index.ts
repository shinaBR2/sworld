import "dotenv/config";
import "./instrument";

import * as Sentry from "@sentry/node";
import { app } from "./server";
import { envConifg } from "./utils/envConfig";

const port = envConifg.port || 4000;

Sentry.setupExpressErrorHandler(app);

const server = app.listen(port, () => {
  // TODO
  // const { NODE_ENV, HOST, PORT } = env;
  // logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
  console.log(`Server is running on port ${port}`);
});

const onCloseSignal = () => {
  // logger.info("sigint received, shutting down");
  server.close(() => {
    // logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
