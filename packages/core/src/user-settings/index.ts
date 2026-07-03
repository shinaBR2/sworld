import { mergeUserSettings, type UserSettingsPatch } from './merge';
import { parseUserSettings } from './parse';
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
  type WatchSettings,
} from './types';

export { parseUserSettings, mergeUserSettings, DEFAULT_USER_SETTINGS };
export type { UserSettings, WatchSettings, UserSettingsPatch };
