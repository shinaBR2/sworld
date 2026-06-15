import { describe, expect, it } from 'vitest';
import { parseHlsManifest } from './parseHlsManifest';

const SOURCE = 'https://cdn.example.com/video/playlist.m3u8';

const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:6
#EXTINF:3.0,
seg-0.ts
#EXTINF:5.96,
/adjump/ad-1.ts
#EXTINF:3.0,
seg-1.ts
#EXT-X-ENDLIST`;

describe('parseHlsManifest', () => {
  it('keeps non-ad segments, renames them, and resolves absolute URLs', () => {
    const result = parseHlsManifest(manifest, SOURCE, [/\/adjump\//]);

    expect(result.segments.included).toEqual([
      {
        url: 'https://cdn.example.com/video/seg-0.ts',
        name: '0.ts',
        duration: 3,
      },
      {
        url: 'https://cdn.example.com/video/seg-1.ts',
        name: '1.ts',
        duration: 3,
      },
    ]);
    expect(result.segments.excluded).toEqual([
      { url: 'https://cdn.example.com/adjump/ad-1.ts', name: '' },
    ]);
  });

  it('sums only included durations (rounded) and rewrites the playlist', () => {
    const result = parseHlsManifest(manifest, SOURCE, [/\/adjump\//]);

    expect(result.duration).toBe(6); // 3 + 3 (ad's 5.96 excluded)
    expect(result.modifiedContent).toContain('#EXT-X-VERSION:3');
    expect(result.modifiedContent).toContain('0.ts');
    expect(result.modifiedContent).toContain('1.ts');
    expect(result.modifiedContent).not.toContain('adjump');
    expect(result.modifiedContent).toContain('#EXT-X-ENDLIST');
  });

  it('keeps all segments when no exclude patterns are given', () => {
    const result = parseHlsManifest(manifest, SOURCE);

    expect(result.segments.included).toHaveLength(3);
    expect(result.segments.excluded).toHaveLength(0);
  });
});
