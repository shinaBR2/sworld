import { Parser } from 'm3u8-parser';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { HlsSegment, ParsedManifest } from './types';

const isAds = (segmentUrl: string, excludePatterns: RegExp[]): boolean =>
  excludePatterns.some((pattern) => pattern.test(segmentUrl));

/** Stable name for the fMP4 init segment we emit in `#EXT-X-MAP`. */
const INIT_NAME = 'init.mp4';

/**
 * Pure parse of an M3U8 playlist: strip ad segments, rename the kept segments,
 * and rebuild the playlist content. No I/O — the caller fetches the playlist text
 * and passes it in.
 *
 * Format-aware passthrough: we keep whatever container the source already uses —
 * MPEG-TS stays `.ts`, fMP4/CMAF stays `.m4s` (carrying its `#EXT-X-MAP` init
 * segment). We never transcode here; converting `.ts` → fMP4 is the on-demand
 * `repair-fmp4` tool's job. Byte-range playlists (single-file fMP4/TS) aren't
 * supported by the byte-copy proxy and fail loud.
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
  const allSegments = manifest.segments ?? [];

  // The byte-copy proxy fetches whole segment files; a byte-range source packs
  // everything into one file addressed by ranges, which we can't proxy. Fail
  // loud (terminal) rather than emit a broken video.
  const hasByteRange = allSegments.some(
    (segment) => segment.byterange || segment.map?.byterange,
  );
  if (hasByteRange) {
    throw CustomError.medium('Byte-range HLS is not supported', {
      errorCode: VIDEO_ERRORS.INVALID_VIDEO_FORMAT,
      shouldRetry: false,
      context: { sourceUrl },
      source: 'services/videos/processing/parseHlsManifest.ts',
    });
  }

  // fMP4/CMAF sources carry an init segment via `#EXT-X-MAP`. Its presence is
  // what makes this an fMP4 stream → keep `.m4s`; otherwise it's MPEG-TS → `.ts`.
  const mapUri = allSegments.find((segment) => segment.map?.uri)?.map?.uri;
  const isFmp4 = Boolean(mapUri);
  const segmentExt = isFmp4 ? 'm4s' : 'ts';

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

  // Carry the fMP4 init segment through, renamed to a stable name.
  let init: HlsSegment | undefined;
  if (isFmp4 && mapUri) {
    init = { url: new URL(mapUri, sourceUrl).toString(), name: INIT_NAME };
    modifiedContent += `#EXT-X-MAP:URI="${INIT_NAME}"\n`;
  }

  let segmentIndex = 0;
  allSegments.forEach((segment) => {
    const segmentUrl = new URL(segment.uri, sourceUrl).toString();

    if (isAds(segmentUrl, excludePatterns)) {
      segments.excluded.push({ url: segmentUrl, name: '' });
    } else if (segment.duration) {
      modifiedContent += `#EXTINF:${segment.duration},\n`;
      totalDuration += segment.duration;
      const segmentName = `${segmentIndex++}.${segmentExt}`;
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

  return {
    modifiedContent,
    segments,
    duration: Math.round(totalDuration),
    init,
  };
};

export { parseHlsManifest };
