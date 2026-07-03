import type { UserSettings, WatchSettings } from './types';

// A patch targets one or more site slices; unset slices/keys are left as-is.
interface UserSettingsPatch {
  watch?: Partial<WatchSettings>;
}

// Read-merge-write: layer a patch over the current settings so a change to one
// site/key never clobbers the others. Core owns the structure, so the merge
// lives here rather than in each app. Extend per-site as new sites gain
// settings (spread `current`, then deep-merge each provided slice).
const mergeUserSettings = (
  current: UserSettings,
  patch: UserSettingsPatch,
): UserSettings => ({
  ...current,
  ...(patch.watch ? { watch: { ...current.watch, ...patch.watch } } : {}),
});

export type { UserSettingsPatch };
export { mergeUserSettings };
