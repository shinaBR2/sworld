import { Auth } from 'core';
import { reconcileCachedSetting } from 'core/user-settings';
import { useSaveUserSettings } from 'core/user-settings/mutation-hooks';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useEffect, useRef, useState } from 'react';
import { StandaloneConflictDialog } from 'ui/watch/standalone-conflict-dialog';
import {
  readStandaloneCache,
  readStandaloneCacheRaw,
  writeStandaloneCache,
} from '../../standalone-mode';

// Reconciles the localStorage boot cache against the DB (source of truth) once
// per session, after the settings query resolves. The router already booted from
// the cache; this closes the loop using the pure policy in core:
//   - cache absent → adopt the DB silently (reload only if the booted mode differs)
//   - cache == DB  → nothing (the common path)
//   - cache != DB  → a genuine cross-device conflict → ask the user which wins
// A resolved choice is written to BOTH stores so it never re-triggers.
const StandaloneReconciler = () => {
  const { getAccessToken } = Auth.useAuthContext();
  const { settings } = useLoadUserSettings({ getAccessToken });
  const { saveUserSettings } = useSaveUserSettings({ getAccessToken });
  const [conflict, setConflict] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // The mode the router actually booted with — captured before any write below.
  const bootedRef = useRef<boolean>(readStandaloneCache());
  const reconciledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!settings || reconciledRef.current) {
      return;
    }
    reconciledRef.current = true;

    const cacheRaw = readStandaloneCacheRaw();
    const action = reconcileCachedSetting({
      cached: cacheRaw === null ? null : cacheRaw === 'true',
      remote: settings.watch.standaloneMode,
      active: bootedRef.current,
    });

    if (action.type === 'adopt') {
      writeStandaloneCache(action.value);
      if (action.reload) {
        window.location.reload();
      }
    } else if (action.type === 'conflict') {
      setConflict(true);
    }
  }, [settings]);

  const handleChoose = async (mode: boolean) => {
    if (!settings || saving) {
      return;
    }

    setSaving(true);
    try {
      await saveUserSettings(settings, { watch: { standaloneMode: mode } });
      writeStandaloneCache(mode);
      if (bootedRef.current !== mode) {
        window.location.reload();
        return;
      }
      setConflict(false);
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  if (!conflict || !settings) {
    return null;
  }

  return (
    <StandaloneConflictDialog
      open={conflict}
      deviceMode={readStandaloneCacheRaw() === 'true'}
      accountMode={settings.watch.standaloneMode}
      onChoose={handleChoose}
      saving={saving}
    />
  );
};

export { StandaloneReconciler };
