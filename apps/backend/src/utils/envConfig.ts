const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
  storageBucket: process.env.GCP_STORAGE_BUCKET,
  sentrydsn: process.env.SENTRY_DSN,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  webhookSignature: process.env.WEBHOOK_SIGNATURE,
  projectId: process.env.GCP_PROJECT_ID,
  location: 'asia-southeast1',
  computeServiceUrl: process.env.COMPUTE_SERVICE_URL,
  ioServiceUrl: process.env.IO_SERVICE_URL,
  cloudTaskServiceAccount: process.env.CLOUD_TASKS_SERVICE_ACCOUNT,
  hasuraEndpoint: process.env.HASURA_ENDPOINT,
  hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
  hashnodeWebhookSecret: process.env.HASHNODE_WEBHOOK_SECRET,
  hashnodeEndpoint: process.env.HASHNODE_ENDPOINT,
  hashnodePersonalToken: process.env.HASHNODE_PERSONAL_TOKEN,
  mainSiteUrl: process.env.MAIN_SITE_URL,
  server: {
    maxBodyLimitInKBNumber: Number(process.env.MAX_BODY_LIMIT ?? 50),
  },
  errorTracker: {
    posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY,
    posthogHost: process.env.POSTHOG_HOST,
  },
};

export { envConfig };
