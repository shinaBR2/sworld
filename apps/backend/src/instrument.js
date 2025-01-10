import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { envConfig } from "./utils/envConfig";

console.log(`Run sentry init`);
Sentry.init({
  dsn: envConfig.sentrydsn,
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
