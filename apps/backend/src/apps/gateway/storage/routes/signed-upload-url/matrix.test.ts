import { describe, expect, it } from 'vitest';
import { extFromContentType, resolveObjectPath } from './matrix';

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

describe('resolveObjectPath', () => {
  it('builds <prefix>/<userId>/<id>/<uuid>.<ext> when an id is given', () => {
    const path = resolveObjectPath({
      site: 'watch',
      action: 'VIDEO_THUMBNAIL_UPLOAD',
      contentType: 'image/png',
      userId: 'user-1',
      id: 'video-9',
    });
    expect(path).toMatch(new RegExp(`^videos/user-1/video-9/${UUID}\\.png$`));
  });

  it('generates a uuid entity key when no id is given', () => {
    const path = resolveObjectPath({
      site: 'listen',
      action: 'AUDIO_UPLOAD',
      contentType: 'audio/mpeg',
      userId: 'u',
    });
    expect(path).toMatch(new RegExp(`^audios/u/${UUID}/${UUID}\\.mp3$`));
  });

  it('routes watch playlist thumbnails to videoPlaylists/', () => {
    const path = resolveObjectPath({
      site: 'watch',
      action: 'PLAYLIST_THUMBNAIL_UPLOAD',
      contentType: 'image/jpeg',
      userId: 'u',
      id: 'p1',
    });
    expect(path).toMatch(new RegExp(`^videoPlaylists/u/p1/${UUID}\\.jpg$`));
  });

  it('rejects an unknown (site, action) pair', () => {
    expect(() =>
      resolveObjectPath({
        site: 'watch',
        action: 'AUDIO_UPLOAD',
        contentType: 'audio/mpeg',
        userId: 'u',
      }),
    ).toThrow(/Unsupported upload/);
  });

  it('rejects a content type not allowed for the action', () => {
    expect(() =>
      resolveObjectPath({
        site: 'main',
        action: 'BOOK_UPLOAD',
        contentType: 'image/png',
        userId: 'u',
      }),
    ).toThrow(/not allowed/);
  });
});

describe('extFromContentType', () => {
  it.each([
    ['image/jpeg', 'jpg'],
    ['audio/mpeg', 'mp3'],
    ['application/pdf', 'pdf'],
    ['video/mp4', 'mp4'],
    ['image/webp', 'webp'],
  ])('%s -> %s', (contentType, ext) => {
    expect(extFromContentType(contentType)).toBe(ext);
  });
});
