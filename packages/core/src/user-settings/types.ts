// The user settings contract lives here, in code — not in the database. The DB
// stores an opaque, site-scoped jsonb blob (`{ watch: { standaloneMode }, ... }`);
// its shape and defaults are owned here so adding a setting is a code change,
// never a data migration. Add per-app sub-objects (listen, main, ...) as they
// gain settings.
interface WatchSettings {
  standaloneMode: boolean;
}

interface UserSettings {
  watch: WatchSettings;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  watch: { standaloneMode: false },
};

export type { UserSettings, WatchSettings };
export { DEFAULT_USER_SETTINGS };
