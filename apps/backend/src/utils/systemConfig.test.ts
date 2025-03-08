import { describe, expect, it } from 'vitest';
import { crawlConfig, queues, systemConfig, uuidNamespaces } from './systemConfig';

describe('systemConfig', () => {
  it('has correct default external request timeout', () => {
    expect(systemConfig.defaultExternalRequestTimeout).toBe(15000);
  });
});

describe('uuidNamespaces', () => {
  it('has correct uuid namespace defined', () => {
    expect(uuidNamespaces.cloudTask).toBe('abd32375-5036-44a1-bc75-c7bb33051b99');
  });
});

describe('queues', () => {
  it('has correct queue names defined', () => {
    expect(queues.streamVideoQueue).toBe('stream-video');
    expect(queues.convertVideoQueue).toBe('convert-video');
  });
});

describe('crawlConfig', () => {
  it('has correct defaultWaitForSelectorTimeout defined', () => {
    expect(crawlConfig.defaultWaitForSelectorTimeout).toBe(10000);
  });
});
