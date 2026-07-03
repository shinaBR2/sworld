import { Auth } from 'core';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useEffect, useRef } from 'react';
import {
  readStandaloneCache,
  writeStandaloneCache,
} from '../../standalone-mode';

// Reconciles the localStorage boot cache against the DB (source of truth) once
// per session, after the settings query resolves. The router already booted from
// the cache (or the default, since the cache is cleared on sign-out); the DB
// always wins — mirror it into the cache and, if what booted differs, reload so
// the router picks up the correct history. No cross-account conflict is possible
// because sign-out clears the flag, so this never needs to ask the user anything.
const StandaloneReconciler = () => {
  const { getAccessToken } = Auth.useAuthContext();
  const { settings } = useLoadUserSettings({ getAccessToken });
  const reconciledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!settings || reconciledRef.current) {
      return;
    }
    reconciledRef.current = true;

    const db = settings.watch.standaloneMode;
    if (readStandaloneCache() !== db) {
      writeStandaloneCache(db);
      window.location.reload();
    }
  }, [settings]);

  return null;
};

export { StandaloneReconciler };
