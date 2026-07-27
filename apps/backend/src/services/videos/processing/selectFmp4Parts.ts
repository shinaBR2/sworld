/** A stored fMP4 object considered for a lossless recovery remux. */
interface StoredPart {
  /** Object name relative to the storage base, e.g. `init.mp4`, `0.m4s`. */
  name: string;
  /** Object size in bytes. */
  size: number;
}

/**
 * ffmpeg 4.4 wrote a 24-byte (moof-only, no mdat) empty first segment. Any
 * `.m4s` at or below this size carries no media and must be skipped — its media
 * lives in the (unusually large) `init.mp4` on the affected videos.
 */
const EMPTY_SEGMENT_MAX_BYTES = 24;

const segmentIndex = (name: string): number =>
  Number(name.match(/(\d+)\.m4s$/)?.[1] ?? 0);

/**
 * Order the stored fMP4 objects to concatenate for a lossless `-c copy` recovery
 * remux — the Infinix case: a media-bearing `init.mp4`, an empty 24-byte
 * `0.m4s`, and good later segments (SWO-639).
 *
 * Returns `[init.mp4, <non-empty .m4s in numeric order>]`. Concatenating these
 * yields a valid fMP4 byte stream (the init already embeds the first fragment's
 * media) that ffmpeg re-segments into a clean playlist with a non-empty first
 * segment. Empty (<= 24-byte) segments are skipped — they hold nothing.
 *
 * A single-fragment video whose entire media lives in the (unusually large)
 * `init.mp4` — an empty `0.m4s` and no later segment — yields `[init.mp4]`
 * alone, which is still a valid remuxable stream. If such an init turns out
 * media-less, the remux produces only an empty segment, which the adapter drops
 * → the engine fails it cleanly rather than shipping a broken rendition.
 *
 * @throws if no `init.mp4` is present (nothing to recover from)
 */
const selectFmp4Parts = (parts: StoredPart[]): string[] => {
  const init = parts.find((part) => part.name === 'init.mp4');
  if (!init) {
    throw new Error('Cannot recover: no init.mp4 among stored fMP4 objects');
  }

  const segments = parts
    .filter(
      (part) =>
        part.name.endsWith('.m4s') && part.size > EMPTY_SEGMENT_MAX_BYTES,
    )
    .sort((a, b) => segmentIndex(a.name) - segmentIndex(b.name))
    .map((part) => part.name);

  return [init.name, ...segments];
};

export { selectFmp4Parts, EMPTY_SEGMENT_MAX_BYTES };
export type { StoredPart };
