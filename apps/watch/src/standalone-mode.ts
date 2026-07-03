// Standalone mode runs the Watch app on in-memory router history so navigation
// never touches the browser URL or history stack — the app behaves like a
// native app (SWO-326). The DB (`user_settings.data.watch.standaloneMode`) is the
// source of truth; this localStorage entry is a synchronous cache read at boot to
// pick the router history before the async DB value can arrive. It is cleared on
// sign-out, so a fresh sign-in always boots from the default until the DB value
// reconciles in (SWO-332) — that's what keeps two accounts on the same browser
// from inheriting each other's mode.
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

// Mirror the resolved DB value into the boot cache; the next boot reads it to
// pick the router history.
const writeStandaloneCache = (value: boolean): void => {
  try {
    localStorage.setItem(STANDALONE_STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    // Ignore storage failures — the DB remains the source of truth.
  }
};

// Cleared on sign-out so the flag never carries one account's preference into
// another account's session on the same browser.
const clearStandaloneCache = (): void => {
  try {
    localStorage.removeItem(STANDALONE_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export {
  STANDALONE_STORAGE_KEY,
  readStandaloneCache,
  writeStandaloneCache,
  clearStandaloneCache,
};
