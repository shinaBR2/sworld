import { describe, expect, it } from 'vitest';
import { parseUserSettings } from './parse';
import { DEFAULT_USER_SETTINGS } from './types';

describe('parseUserSettings', () => {
  it('returns defaults for an empty blob', () => {
    expect(parseUserSettings({})).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('returns defaults for a partial blob missing the key', () => {
    expect(parseUserSettings({ watch: {} })).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('reads a valid stored value', () => {
    expect(parseUserSettings({ watch: { standaloneMode: true } })).toEqual({
      watch: { standaloneMode: true },
    });
  });

  it('falls back to default when the value has the wrong type', () => {
    expect(parseUserSettings({ watch: { standaloneMode: 'yes' } })).toEqual(
      DEFAULT_USER_SETTINGS,
    );
  });

  it('ignores unknown keys', () => {
    expect(
      parseUserSettings({ watch: { standaloneMode: true }, listen: { x: 1 } }),
    ).toEqual({ watch: { standaloneMode: true } });
  });

  it.each([null, undefined, 'string', 42, [], [{ watch: {} }]])(
    'returns defaults for non-object input: %p',
    (input) => {
      expect(parseUserSettings(input)).toEqual(DEFAULT_USER_SETTINGS);
    },
  );

  it('never returns the shared defaults reference (safe to mutate result)', () => {
    expect(parseUserSettings({})).not.toBe(DEFAULT_USER_SETTINGS);
  });
});
