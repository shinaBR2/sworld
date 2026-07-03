// Standalone mode runs the Watch app on in-memory router history so navigation
// never touches the browser URL or history stack — the app behaves like a
// native app (SWO-326). The DB (`users.settings.watch.standaloneMode`) is the
// source of truth; this localStorage entry is a synchronous cache read at boot
// to pick the router history before the async DB value can arrive. The DB value
// reconciles into this cache after auth (SWO-332).
const STANDALONE_STORAGE_KEY = 'watch:standalone';

const readStandaloneCache = (): boolean => {
  try {
    return localStorage.getItem(STANDALONE_STORAGE_KEY) === 'true';
  } catch {
    // localStorage can throw (private mode, disabled storage) — fall back to
    // the default (browser history) rather than break boot.
    return false;
  }
};

// Mirror the resolved setting into the boot cache. Written after a successful DB
// save (SWO-331) or conflict resolution (SWO-332); the next boot reads it to pick
// the router history. Stored explicitly as `'true'`/`'false'` (not removed on
// off) so the reconcile step (SWO-332) can tell an explicit off apart from a
// never-set device — boot still treats `'false'` and absent identically.
const writeStandaloneCache = (value: boolean): void => {
  try {
    localStorage.setItem(STANDALONE_STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    // Ignore storage failures — the DB remains the source of truth.
  }
};

export { STANDALONE_STORAGE_KEY, readStandaloneCache, writeStandaloneCache };
