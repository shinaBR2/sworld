import { hasuraConfig } from './envConfig';

const config = {
  allowedOrigin: import.meta.env.VITE_ALLOWED_ORIGIN,
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ?? new URL(hasuraConfig.url).origin,
};

export { config };
