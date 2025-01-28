import { describe, it, expect } from 'vitest';
import { systemConfig, uuidNamespaces } from './systemConfig';

describe('systemConfig', () => {
  it('has correct default external request timeout', () => {
    expect(systemConfig.defaultExternalRequestTimeout).toBe(5000);
  });
});

describe('uuidNamespaces', () => {
  it('has cloudTask UUID namespace', () => {
    expect(uuidNamespaces.cloudTask).toBe(
      'abd32375-5036-44a1-bc75-c7bb33051b99'
    );
  });
});
