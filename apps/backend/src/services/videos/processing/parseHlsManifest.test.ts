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

  it('always emits #EXTM3U even without a version tag', () => {
    const versionless = '#EXTM3U\n#EXTINF:3,\nseg-0.ts\n#EXT-X-ENDLIST';
    const result = parseHlsManifest(versionless, SOURCE);

    expect(result.modifiedContent.startsWith('#EXTM3U')).toBe(true);
    expect(result.modifiedContent).not.toContain('#EXT-X-VERSION');
  });

  it('leaves a .ts source as .ts with no init', () => {
    const result = parseHlsManifest(manifest, SOURCE);
    expect(result.init).toBeUndefined();
    expect(result.modifiedContent).not.toContain('#EXT-X-MAP');
    expect(result.segments.included.every((s) => s.name.endsWith('.ts'))).toBe(
      true,
    );
  });

  it('keeps an fMP4 source as .m4s and carries the init (#EXT-X-MAP)', () => {
    const fmp4 = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:6
#EXT-X-MAP:URI="main-init.mp4"
#EXTINF:6.0,
seg-0.m4s
#EXTINF:6.0,
seg-1.m4s
#EXT-X-ENDLIST`;
    const result = parseHlsManifest(fmp4, SOURCE);

    expect(result.init).toEqual({
      url: 'https://cdn.example.com/video/main-init.mp4',
      name: 'init.mp4',
    });
    expect(result.modifiedContent).toContain('#EXT-X-MAP:URI="init.mp4"');
    expect(result.segments.included).toEqual([
      {
        url: 'https://cdn.example.com/video/seg-0.m4s',
        name: '0.m4s',
        duration: 6,
      },
      {
        url: 'https://cdn.example.com/video/seg-1.m4s',
        name: '1.m4s',
        duration: 6,
      },
    ]);
  });

  it('fails loud on a byte-range source (unsupported)', () => {
    const byteRange = `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-MAP:URI="main.mp4",BYTERANGE="800@0"
#EXTINF:6.0,
#EXT-X-BYTERANGE:50000@800
main.mp4
#EXT-X-ENDLIST`;

    expect(() => parseHlsManifest(byteRange, SOURCE)).toThrow(
      'Byte-range HLS is not supported',
    );
  });
});
