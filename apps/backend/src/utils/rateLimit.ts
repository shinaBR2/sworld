const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const getKey = (ip: string, extensionId: string): string => {
  return `${ip}:${extensionId}`;
};

const checkRateLimit = (ip: string, extensionId: string): void => {
  const key = getKey(ip, extensionId);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    throw new Error('rate_limit_exceeded');
  }

  entry.count += 1;
};

const resetRateLimitStore = (): void => {
  store.clear();
};

export { checkRateLimit, resetRateLimitStore, MAX_REQUESTS, WINDOW_MS };
