import { DEFAULT_USER_SETTINGS, type UserSettings } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Deep-merges a stored settings blob over the code-owned defaults. The DB blob
// is partial and untyped (jsonb) — a brand-new user's is `{}`, and older rows
// may lack keys added later — so every absent site/key falls back to a default.
// Callers always receive a fully-populated, typed UserSettings and never read a
// raw path off the blob.
const parseUserSettings = (raw: unknown): UserSettings => {
  const blob = isRecord(raw) ? raw : {};
  const watch = isRecord(blob.watch) ? blob.watch : {};

  return {
    watch: {
      standaloneMode:
        typeof watch.standaloneMode === 'boolean'
          ? watch.standaloneMode
          : DEFAULT_USER_SETTINGS.watch.standaloneMode,
    },
  };
};

export { parseUserSettings };
