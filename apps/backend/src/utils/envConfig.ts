const envConifg = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
  storageBucket: process.env.GCP_STORAGE_BUCKET,
  sentrydsn: process.env.SENTRY_DSN,
};

export { envConifg };
