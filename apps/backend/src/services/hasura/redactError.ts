import { ClientError } from 'graphql-request';

/**
 * Rebuild a hasura request failure as an error that is SAFE TO LOG.
 *
 * graphql-request's `ClientError.message` embeds the entire request — query AND
 * variables — as single-line JSON. Any telegram credential mutation passes the
 * password-equivalent session string (`sessionString` / `pendingSessionString`)
 * as a variable, so logging that raw error (as `withRetry` does on every retry
 * attempt) or threading it as an error `cause` (as the gateway may log) would
 * write the session into application logs — reconstructable by anyone with log
 * access.
 *
 * So on failure, surface ONLY the Hasura GraphQL error text (Hasura's own
 * messages never echo the input variables) under an operation label, and DROP the
 * raw ClientError entirely — never carry it as `cause`. A non-ClientError (e.g. a
 * transport error) has no request variables in its message, so it is safe to
 * relabel as-is.
 */
const redactHasuraError = (operation: string, error: unknown): Error => {
  if (error instanceof ClientError) {
    const detail =
      error.response?.errors?.map((e) => e.message).join('; ') ||
      `request failed with status ${error.response?.status ?? 'unknown'}`;
    return new Error(`${operation} failed: ${detail}`);
  }
  return new Error(
    `${operation} failed: ${error instanceof Error ? error.message : String(error)}`,
  );
};

export { redactHasuraError };
