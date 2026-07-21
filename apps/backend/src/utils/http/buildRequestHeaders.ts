/**
 * Default desktop Chrome User-Agent for outbound fetches in the video-processing
 * path. Many source CDNs reject the bare `node`/`undici` or `curl` User-Agent, so
 * always presenting a real browser UA defeats that class of block on its own.
 */
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';

/**
 * Build headers for an outbound fetch: always a browser User-Agent, plus any
 * per-source custom headers (e.g. a `Referer` from
 * `videos.metadata.customRequestHeaders`) shallow-merged on top.
 *
 * Custom headers win over the defaults, so a caller can override the User-Agent
 * if it ever needs to. Safe with `undefined` or `{}`.
 */
const buildRequestHeaders = (
  custom?: Record<string, string>,
): Record<string, string> => {
  return {
    'User-Agent': DEFAULT_USER_AGENT,
    ...custom,
  };
};

export { DEFAULT_USER_AGENT, buildRequestHeaders };
