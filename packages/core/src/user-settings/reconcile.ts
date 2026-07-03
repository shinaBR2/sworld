// Pure policy for reconciling a device-cached boolean setting against the
// source-of-truth (DB) value at boot. The app layer maps its storage specifics
// onto these three inputs and executes the returned action; keeping the decision
// pure makes the (subtle) edge cases testable.
type ReconcileAction =
  | { type: 'noop' }
  | { type: 'adopt'; value: boolean; reload: boolean }
  | { type: 'conflict' };

interface ReconcileInput {
  // The device's cached preference; null when never set on this device.
  cached: boolean | null;
  // The source-of-truth value (from the DB).
  remote: boolean;
  // The value currently in effect — what the app booted with.
  active: boolean;
}

const reconcileCachedSetting = (input: ReconcileInput): ReconcileAction => {
  const { cached, remote, active } = input;

  // Never set here (fresh device / cleared cache) → adopt the source of truth
  // silently, reloading only if what booted doesn't already match it.
  if (cached === null) {
    return { type: 'adopt', value: remote, reload: active !== remote };
  }

  // The common path: the device already agrees with the source of truth.
  if (cached === remote) {
    return { type: 'noop' };
  }

  // Genuine cross-device divergence — the caller must ask the user to choose.
  return { type: 'conflict' };
};

export type { ReconcileAction, ReconcileInput };
export { reconcileCachedSetting };
