const envConifg = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
  storageBucket: process.env.GCP_STORAGE_BUCKET,
  sentrydsn: process.env.SENTRY_DSN,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export { envConifg };
