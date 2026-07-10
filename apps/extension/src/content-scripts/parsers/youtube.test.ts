import { describe, expect, it } from 'vitest';
import {
  extractYouTubeMetadata,
  getMetaContent,
  getVideoId,
  parseDuration,
} from './youtube';

describe('parseDuration', () => {
  it('should parse full duration', () => {
    expect(parseDuration('PT1H2M30S')).toBe(3750);
  });

  it('should parse minutes and seconds', () => {
    expect(parseDuration('PT5M30S')).toBe(330);
  });

  it('should parse only seconds', () => {
    expect(parseDuration('PT45S')).toBe(45);
  });

  it('should parse only hours', () => {
    expect(parseDuration('PT2H')).toBe(7200);
  });

  it('should return undefined for invalid format', () => {
    expect(parseDuration('invalid')).toBeUndefined();
  });
});

describe('getVideoId', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should extract video id from /watch path', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://youtube.com/watch?v=dQw4w9WgXcQ'),
      writable: true,
    });
    expect(getVideoId()).toBe('dQw4w9WgXcQ');
  });

  it('should extract video id from /embed path', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://youtube.com/embed/dQw4w9WgXcQ'),
      writable: true,
    });
    expect(getVideoId()).toBe('dQw4w9WgXcQ');
  });

  it('should extract video id from youtu.be short URL', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://youtu.be/dQw4w9WgXcQ'),
      writable: true,
    });
    expect(getVideoId()).toBe('dQw4w9WgXcQ');
  });

  it('should return undefined for non-video path', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://youtube.com/feed'),
      writable: true,
    });
    expect(getVideoId()).toBeUndefined();
  });
});

describe('getMetaContent', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('should get meta content by property', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', 'Test Title');
    document.head.appendChild(meta);

    expect(getMetaContent('og:title')).toBe('Test Title');
  });

  it('should get meta content by name', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Test Description');
    document.head.appendChild(meta);

    expect(getMetaContent('description')).toBe('Test Description');
  });

  it('should return undefined when meta not found', () => {
    expect(getMetaContent('og:title')).toBeUndefined();
  });
});

describe('extractYouTubeMetadata', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('should return correct url', () => {
    const metadata = extractYouTubeMetadata();
    expect(metadata.url).toBe(window.location.href);
  });

  it('should set platform to youtube', () => {
    const metadata = extractYouTubeMetadata();
    expect(metadata.platform).toBe('youtube');
  });

  it('should extract title from og:title', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', 'Video Title');
    document.head.appendChild(meta);

    const metadata = extractYouTubeMetadata();
    expect(metadata.title).toBe('Video Title');
  });

  it('should extract thumbnail from og:image', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:image');
    meta.setAttribute('content', 'https://example.com/thumb.jpg');
    document.head.appendChild(meta);

    const metadata = extractYouTubeMetadata();
    expect(metadata.thumbnailUrl).toBe('https://example.com/thumb.jpg');
  });

  it('should construct thumbnail from video id when og:image absent', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://youtube.com/watch?v=dQw4w9WgXcQ'),
      writable: true,
    });

    const metadata = extractYouTubeMetadata();
    expect(metadata.thumbnailUrl).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    );
  });

  it('should extract duration', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('itemprop', 'duration');
    meta.setAttribute('content', 'PT5M30S');
    document.head.appendChild(meta);

    const metadata = extractYouTubeMetadata();
    expect(metadata.duration).toBe(330);
  });
});
