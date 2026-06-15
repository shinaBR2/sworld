import { Parser } from 'm3u8-parser';
import type { HlsSegment, ParsedManifest } from './types';

const isAds = (segmentUrl: string, excludePatterns: RegExp[]): boolean =>
  excludePatterns.some((pattern) => pattern.test(segmentUrl));

/**
 * Pure parse of an M3U8 playlist: strip ad segments, rename the kept segments
 * (`<n>.ts`), and rebuild the playlist content. No I/O — the caller fetches the
 * playlist text and passes it in. Extracted verbatim from the previous
 * `parseM3U8Content` so behaviour is identical.
 *
 * @param content - Raw M3U8 playlist text
 * @param sourceUrl - Playlist URL, used to resolve relative segment URIs
 * @param excludePatterns - RegExps matching ad segment URLs to drop
 */
const parseHlsManifest = (
  content: string,
  sourceUrl: string,
  excludePatterns: RegExp[] = [],
): ParsedManifest => {
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;
  const segments: ParsedManifest['segments'] = {
    included: [] as HlsSegment[],
    excluded: [] as HlsSegment[],
  };

  let modifiedContent = '';
  let totalDuration = 0;

  // #EXTM3U is mandatory and must be the first line; the version tag is optional.
  modifiedContent += '#EXTM3U\n';
  if (manifest.version) {
    modifiedContent += `#EXT-X-VERSION:${manifest.version}\n`;
  }

  if (manifest.playlistType) {
    modifiedContent += `#EXT-X-PLAYLIST-TYPE:${manifest.playlistType}\n`;
  }

  if (manifest.targetDuration) {
    modifiedContent += `#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
  }

  let segmentIndex = 0;
  manifest.segments?.forEach((segment) => {
    const segmentUrl = new URL(segment.uri, sourceUrl).toString();

    if (isAds(segmentUrl, excludePatterns)) {
      segments.excluded.push({ url: segmentUrl, name: '' });
    } else if (segment.duration) {
      modifiedContent += `#EXTINF:${segment.duration},\n`;
      totalDuration += segment.duration;
      const segmentName = `${segmentIndex++}.ts`;
      modifiedContent += `${segmentName}\n`;
      segments.included.push({
        url: segmentUrl,
        name: segmentName,
        duration: segment.duration,
      });
    }
  });

  if (manifest.endList) {
    modifiedContent += '#EXT-X-ENDLIST\n';
  }

  return { modifiedContent, segments, duration: Math.round(totalDuration) };
};

export { parseHlsManifest };
