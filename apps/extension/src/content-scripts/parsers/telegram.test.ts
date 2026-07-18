import { describe, expect, it } from 'vitest';
import {
  extractTelegramMetadata,
  getChannelFromTmePath,
  getChannelIdFromHash,
  getVariant,
  isTmeHostname,
} from './telegram';

describe('getVariant', () => {
  it('should detect k variant', () => {
    expect(getVariant('/k/')).toBe('k');
  });

  it('should detect a variant', () => {
    expect(getVariant('/a/')).toBe('a');
  });

  it('should detect z variant', () => {
    expect(getVariant('/z/')).toBe('z');
  });

  it('should return undefined for root path', () => {
    expect(getVariant('/')).toBeUndefined();
  });

  it('should return undefined for unrelated path', () => {
    expect(getVariant('/something/')).toBeUndefined();
  });
});

describe('getChannelIdFromHash', () => {
  it('should extract username channel from # @ username hash', () => {
    expect(getChannelIdFromHash('#@somechannel')).toBe('@somechannel');
  });

  it('should extract negative numeric peer id (channel/group)', () => {
    expect(getChannelIdFromHash('#-582839764')).toBe('-582839764');
  });

  it('should reject positive numeric peer id (personal/direct chat)', () => {
    expect(getChannelIdFromHash('#8115119658')).toBeUndefined();
  });

  it('should reject a username starting with a digit', () => {
    expect(getChannelIdFromHash('#@12345')).toBeUndefined();
  });

  it('should reject a hash with an unconfirmed message-id suffix rather than guess', () => {
    // We don't know whether web.telegram.org appends a suffix like this for jump-to-message
    // links, and an underscore-based suffix would be ambiguous with legitimate username
    // characters, so this intentionally does NOT extract '-1001234567890'.
    expect(getChannelIdFromHash('#-1001234567890_98765')).toBeUndefined();
  });

  it('should return undefined for empty hash (chat list)', () => {
    expect(getChannelIdFromHash('')).toBeUndefined();
  });

  it('should return undefined for non-matching hash', () => {
    expect(getChannelIdFromHash('#/settings')).toBeUndefined();
  });
});

describe('isTmeHostname', () => {
  it('should recognize t.me', () => {
    expect(isTmeHostname('t.me')).toBe(true);
  });

  it('should recognize www.t.me', () => {
    expect(isTmeHostname('www.t.me')).toBe(true);
  });

  it('should reject web.telegram.org', () => {
    expect(isTmeHostname('web.telegram.org')).toBe(false);
  });
});

describe('getChannelFromTmePath', () => {
  it('should extract channel username from bare t.me path', () => {
    expect(getChannelFromTmePath('/ngocmaicutiiii')).toEqual({
      channelId: 'ngocmaicutiiii',
      messageId: undefined,
    });
  });

  it('should extract channel username and message id from /s/ path', () => {
    expect(getChannelFromTmePath('/ngocmaicutiiii/s/3')).toEqual({
      channelId: 'ngocmaicutiiii',
      messageId: '3',
    });
  });

  it('should return empty object for a joinchat path', () => {
    expect(getChannelFromTmePath('/joinchat/AbCdEfGh')).toEqual({});
  });

  it('should return empty object for reserved single-segment routes', () => {
    expect(getChannelFromTmePath('/confirmphone')).toEqual({});
    expect(getChannelFromTmePath('/giftcode')).toEqual({});
    expect(getChannelFromTmePath('/share')).toEqual({});
  });

  it('should return empty object for root path', () => {
    expect(getChannelFromTmePath('/')).toEqual({});
  });
});

describe('extractTelegramMetadata', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should extract username channel and variant for /k/ hash URL', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://web.telegram.org/k/#@somechannel'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.source).toBe('web-app');
    expect(metadata.channelId).toBe('@somechannel');
    if (metadata.source === 'web-app') {
      expect(metadata.variant).toBe('k');
    }
  });

  it('should extract numeric channel and variant for /a/ hash URL', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://web.telegram.org/a/#-582839764'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.source).toBe('web-app');
    expect(metadata.channelId).toBe('-582839764');
    if (metadata.source === 'web-app') {
      expect(metadata.variant).toBe('a');
    }
  });

  it('should not detect a channel for a personal chat on /a/', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://web.telegram.org/a/#8115119658'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.channelId).toBeUndefined();
  });

  it('should not detect a channel for the chat list (no hash)', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://web.telegram.org/k/'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.channelId).toBeUndefined();
  });

  it('should extract bare username channel for a t.me link', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://t.me/ngocmaicutiiii'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.source).toBe('share-link');
    expect(metadata.channelId).toBe('ngocmaicutiiii');
    if (metadata.source === 'share-link') {
      expect(metadata.messageId).toBeUndefined();
    }
  });

  it('should extract channel and message id for a t.me single-post link', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://t.me/ngocmaicutiiii/s/3'),
      writable: true,
    });
    const metadata = extractTelegramMetadata();
    expect(metadata.channelId).toBe('ngocmaicutiiii');
    if (metadata.source === 'share-link') {
      expect(metadata.messageId).toBe('3');
    }
  });
});
