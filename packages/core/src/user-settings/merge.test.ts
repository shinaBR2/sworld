import { describe, expect, it } from 'vitest';
import { mergeUserSettings } from './merge';
import { DEFAULT_USER_SETTINGS } from './types';

describe('mergeUserSettings', () => {
  it('patches a single key, leaving the current object untouched (immutable)', () => {
    const current = DEFAULT_USER_SETTINGS;
    const next = mergeUserSettings(current, {
      watch: { standaloneMode: true },
    });

    expect(next).toEqual({ watch: { standaloneMode: true } });
    expect(current).toEqual(DEFAULT_USER_SETTINGS); // not mutated
  });

  it('returns an equal-but-new object for an empty patch', () => {
    const current = { watch: { standaloneMode: true } };
    const next = mergeUserSettings(current, {});

    expect(next).toEqual(current);
    expect(next).not.toBe(current);
  });

  it('overrides only the patched key within a site slice', () => {
    const current = { watch: { standaloneMode: false } };
    const next = mergeUserSettings(current, {
      watch: { standaloneMode: true },
    });

    expect(next.watch.standaloneMode).toBe(true);
  });
});
