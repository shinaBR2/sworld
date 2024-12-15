import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { envConifg } from "./utils/envConfig";

console.log(`Run sentry init`);
Sentry.init({
  dsn: envConifg.sentrydsn,
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
