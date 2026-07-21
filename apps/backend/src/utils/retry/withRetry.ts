import { getCurrentLogger } from 'src/utils/logger';

interface RetryLogger {
  warn(obj: unknown, msg?: string): void;
}

interface WithRetryOptions {
  /** Short label for logging which operation is being retried. */
  label: string;
  /** Total attempts including the first (default 4). */
  attempts?: number;
  /** Base delay in ms; backoff is linear (`delayMs * attempt`) (default 1500). */
  delayMs?: number;
  /** Decide whether an error is worth retrying (default: retry everything). */
  isRetryable?: (error: unknown) => boolean;
  /** Logger for retry warnings (default: the ambient request logger). */
  logger?: RetryLogger;
}

/**
 * An error is retryable unless it is explicitly marked non-retryable
 * (`shouldRetry === false` — e.g. a 4xx from `fetchWithError`, which won't change
 * on retry). Transient drops (socket/body timeouts, 5xx) carry
 * `shouldRetry: true` or have no `shouldRetry` at all, so they retry. Duck-typed
 * on the field rather than `instanceof CustomError` so it survives mocking.
 */
const isRetryableError = (error: unknown): boolean =>
  (error as { shouldRetry?: boolean } | null | undefined)?.shouldRetry !==
  false;

/**
 * Retry a transient async operation (socket drops, body timeouts, 5xx) with
 * linear backoff. Stops early on a non-retryable error and rethrows the last
 * error once attempts are exhausted.
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  options: WithRetryOptions,
): Promise<T> => {
  const {
    label,
    attempts = 4,
    delayMs = 1500,
    isRetryable = () => true,
    logger = getCurrentLogger(),
  } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt === attempts) {
        break;
      }

      const message =
        error instanceof Error ? error.message.split('\n')[0] : String(error);
      logger.warn(
        { label, attempt, attempts, message },
        `Retrying ${label} after transient failure`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
};

export { withRetry, isRetryableError, type WithRetryOptions };
