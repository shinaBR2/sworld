import { type StoredPart, selectFmp4Parts } from './selectFmp4Parts';

/**
 * How a reprocess should read a video's media, decided from the objects already
 * stored at its base (SWO-639):
 * - `hls-ts`: a stored MPEG-TS playlist is present → remux `playlist.m3u8`.
 * - `fmp4-parts`: no `.ts`, so recover from the stored fMP4 objects → concat the
 *   listed part names (init + non-empty segments) and remux.
 */
type ReprocessSourcePlan =
  | { kind: 'hls-ts' }
  | { kind: 'fmp4-parts'; partNames: string[] };

/**
 * Decide the reprocess source from the TOP-LEVEL objects at the video's storage
 * base (callers exclude any previous `v<N>/` rendition — a reprocess always
 * reads the original outputs, never a prior reprocess).
 *
 * @throws (via {@link selectFmp4Parts}) when there is no `.ts` and no recoverable
 *   fMP4 either — there is nothing to reprocess.
 */
const planReprocessSource = (
  topLevelParts: StoredPart[],
): ReprocessSourcePlan => {
  const hasTs = topLevelParts.some((part) => part.name.endsWith('.ts'));
  if (hasTs) {
    return { kind: 'hls-ts' };
  }
  return { kind: 'fmp4-parts', partNames: selectFmp4Parts(topLevelParts) };
};

export { planReprocessSource };
export type { ReprocessSourcePlan };
