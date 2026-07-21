import { describe, expect, it } from 'vitest';
import { selectVariantUrl } from './selectVariantUrl';

const SOURCE = 'https://cdn.example.com/video/master.m3u8';

describe('selectVariantUrl', () => {
  it('returns null for a media playlist (has segments)', () => {
    const media = '#EXTM3U\n#EXTINF:3,\nseg-0.ts\n#EXT-X-ENDLIST';
    expect(selectVariantUrl(media, SOURCE)).toBeNull();
  });

  it('returns the highest-bandwidth variant for a master playlist', () => {
    const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000
low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2000000
high.m3u8`;
    expect(selectVariantUrl(master, SOURCE)).toBe(
      'https://cdn.example.com/video/high.m3u8',
    );
  });

  it('picks the highest bandwidth even when it is listed first', () => {
    const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2000000
high.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000
low.m3u8`;
    expect(selectVariantUrl(master, SOURCE)).toBe(
      'https://cdn.example.com/video/high.m3u8',
    );
  });

  it('returns null when there are neither segments nor variants', () => {
    expect(selectVariantUrl('#EXTM3U\n', SOURCE)).toBeNull();
  });
});
