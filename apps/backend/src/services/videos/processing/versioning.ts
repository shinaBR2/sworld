const VERSION_DIR = /^v(\d+)\//;

/**
 * The next reprocess version directory (`v1`, `v2`, …) for a video's storage
 * base, given the object names already stored under it.
 *
 * Reprocess writes EVERY output (init, segments, manifest) under this fresh
 * subfolder so it never overwrites a cache-immutable object: stored objects
 * carry a 1-year `max-age`, and `storage.googleapis.com` does not purge its edge
 * on overwrite — so re-uploading under an existing name is invisible for a year.
 * A brand-new `v<N>/` path sidesteps caching entirely (SWO-639).
 *
 * @param existingObjectNames object names relative to the storage base (e.g.
 *   `playlist.m3u8`, `init.mp4`, `v1/init.mp4`)
 * @returns the next unused `v<N>` directory name
 */
const nextVersionDir = (existingObjectNames: string[]): string => {
  let max = 0;
  for (const name of existingObjectNames) {
    const match = name.match(VERSION_DIR);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `v${max + 1}`;
};

export { nextVersionDir };
