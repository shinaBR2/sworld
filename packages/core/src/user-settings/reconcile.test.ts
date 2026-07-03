import { describe, expect, it } from 'vitest';
import { reconcileCachedSetting } from './reconcile';

describe('reconcileCachedSetting', () => {
  it('adopts remote silently when cache is absent and booted matches', () => {
    expect(
      reconcileCachedSetting({ cached: null, remote: false, active: false }),
    ).toEqual({ type: 'adopt', value: false, reload: false });
  });

  it('adopts remote and reloads when cache is absent and booted differs', () => {
    expect(
      reconcileCachedSetting({ cached: null, remote: true, active: false }),
    ).toEqual({ type: 'adopt', value: true, reload: true });
  });

  it('does nothing when cache agrees with remote', () => {
    expect(
      reconcileCachedSetting({ cached: true, remote: true, active: true }),
    ).toEqual({ type: 'noop' });
    expect(
      reconcileCachedSetting({ cached: false, remote: false, active: false }),
    ).toEqual({ type: 'noop' });
  });

  it('flags a conflict when cache and remote disagree', () => {
    expect(
      reconcileCachedSetting({ cached: true, remote: false, active: true }),
    ).toEqual({ type: 'conflict' });
    expect(
      reconcileCachedSetting({ cached: false, remote: true, active: false }),
    ).toEqual({ type: 'conflict' });
  });
});
