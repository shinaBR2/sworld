import { describe, expect, it } from 'vitest';
import { detect, detectPageType, hasVideoElement } from './detector';

describe('detectPageType', () => {
  it('should detect youtube from /watch URL', () => {
    expect(detectPageType('https://youtube.com/watch?v=abc')).toBe('youtube');
  });

  it('should detect youtube from youtu.be URL', () => {
    expect(detectPageType('https://youtu.be/abc')).toBe('youtube');
  });

  it('should detect vimeo URL', () => {
    expect(detectPageType('https://vimeo.com/12345')).toBe('vimeo');
  });

  it('should detect web.telegram.org URL', () => {
    expect(detectPageType('https://web.telegram.org/k/#@somechannel')).toBe(
      'telegram',
    );
  });

  it('should detect t.me URL', () => {
    expect(detectPageType('https://t.me/somechannel')).toBe('telegram');
  });

  it('should detect PDF URL', () => {
    expect(detectPageType('https://example.com/doc.pdf')).toBe('pdf');
  });

  it('should default to webpage', () => {
    expect(detectPageType('https://example.com')).toBe('webpage');
  });

  it('should return unknown for undefined URL', () => {
    expect(detectPageType(undefined)).toBe('unknown');
  });
});

describe('hasVideoElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return true when video element exists', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);
    expect(hasVideoElement()).toBe(true);
  });

  it('should return false when no video element', () => {
    expect(hasVideoElement()).toBe(false);
  });
});

describe('detect', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  it('should return youtube type with metadata for youtube URL', () => {
    const result = detect('https://youtube.com/watch?v=abc');
    expect(result.pageType).toBe('youtube');
    expect(result.content).not.toBeNull();
    if (result.content && 'platform' in result.content) {
      expect(result.content.platform).toBe('youtube');
    }
  });

  it('should return vimeo type with metadata for vimeo URL', () => {
    const result = detect('https://vimeo.com/12345');
    expect(result.pageType).toBe('vimeo');
    expect(result.content).not.toBeNull();
    if (result.content && 'platform' in result.content) {
      expect(result.content.platform).toBe('vimeo');
    }
  });

  it('should return telegram type with metadata for web.telegram.org URL', () => {
    const result = detect('https://web.telegram.org/k/#@somechannel');
    expect(result.pageType).toBe('telegram');
    expect(result.content).not.toBeNull();
    if (result.content && 'url' in result.content) {
      expect('channelId' in result.content).toBe(true);
    }
  });

  it('should return pdf type for PDF URL', () => {
    const result = detect('https://example.com/doc.pdf');
    expect(result.pageType).toBe('pdf');
    expect(result.content).toBeNull();
  });

  it('should return video-generic when video element exists', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);
    const result = detect('https://example.com');
    expect(result.pageType).toBe('video-generic');
    expect(result.content).toBeNull();
  });

  it('should return webpage type for regular URL', () => {
    const result = detect('https://example.com');
    expect(result.pageType).toBe('webpage');
    expect(result.content).toBeNull();
  });
});
