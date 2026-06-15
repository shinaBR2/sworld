import { Parser } from 'm3u8-parser';
import { fetchWithError } from 'src/utils/fetch';
import { buildRequestHeaders } from 'src/utils/http/buildRequestHeaders';

interface HLSSegment {
  url: string;
  name: string;
  duration?: number;
}
interface ParsedResult {
  modifiedContent: string;
  segments: {
    included: HLSSegment[];
    excluded: HLSSegment[];
  };
  duration: number;
}

const isAds = (segmentUrl: string, excludePatterns: RegExp[]) => {
  return excludePatterns.some((pattern) => pattern.test(segmentUrl));
};

/**
 * Parse M3U8 playlist and filter out ad segments
 * @param m3u8Url - URL of the M3U8 playlist
 * @param excludePatterns - Array of RegExp to match ad segment URLs (e.g., /\/adjump\//)
 * @returns {
 *   modifiedContent: Clean M3U8 content without ads,
 *   segments: {
 *     included: Array of non-ad segment URLs to download,
 *     excluded: Array of ad segment URLs that were filtered out
 *   }
 * }
 *
 * Still used by the fix-duration / fix-thumbnail handlers and the CLI. The main
 * stream path now parses via the processing core's `parseHlsManifest`.
 */
const parseM3U8Content = async (
  m3u8Url: string,
  excludePatterns: RegExp[] = [],
  customRequestHeaders?: Record<string, string>,
): Promise<ParsedResult> => {
  const response = await fetchWithError(m3u8Url, {
    headers: buildRequestHeaders(customRequestHeaders),
  });
  const content = await response.text();
  const parser = new Parser();
  parser.push(content);
  parser.end();

  const manifest = parser.manifest;
  const segments = {
    included: [] as HLSSegment[],
    excluded: [] as HLSSegment[],
  };

  let modifiedContent = '';
  let totalDuration = 0;

  // Add header tags
  if (manifest.version) {
    modifiedContent += `#EXTM3U\n`;
    modifiedContent += `#EXT-X-VERSION:${manifest.version}\n`;
  }

  // Add playlist type if present
  if (manifest.playlistType) {
    modifiedContent += `#EXT-X-PLAYLIST-TYPE:${manifest.playlistType}\n`;
  }

  // Add target duration
  if (manifest.targetDuration) {
    modifiedContent += `#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
  }

  // Process segments
  let segmentIndex = 0;
  manifest.segments?.forEach((segment) => {
    const segmentUrl = new URL(segment.uri, m3u8Url).toString();

    if (isAds(segmentUrl, excludePatterns)) {
      segments.excluded.push({
        url: segmentUrl,
        name: '',
      });
    } else {
      // Include non-ad segment
      if (segment.duration) {
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
    }
  });

  // Add endlist if present
  if (manifest.endList) {
    modifiedContent += '#EXT-X-ENDLIST\n';
  }

  return { modifiedContent, segments, duration: Math.round(totalDuration) };
};

export { parseM3U8Content };
