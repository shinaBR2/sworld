import { planReprocessSource } from './planReprocessSource';
import type { StoredPart } from './selectFmp4Parts';
import type { RepackageSource } from './types';
import { nextVersionDir } from './versioning';

const PLAYLIST_NAME = 'playlist.m3u8';

/** A stored object as listed from GCS: full object name + byte size. */
interface StoredObject {
  name: string;
  size: number;
}

/**
 * Split the objects stored under `basePath` into the names used for versioning
 * (ALL of them, including nested `v<N>/…` renditions, so the max version is
 * found) and the TOP-LEVEL parts that feed the source decision (a reprocess
 * always reads the original outputs, never a prior `v<N>/` rendition).
 */
const toStoredParts = (
  objects: StoredObject[],
  basePath: string,
): { relativeNames: string[]; topLevel: StoredPart[] } => {
  const relative = objects
    .map((object) => ({
      name: object.name.slice(basePath.length + 1),
      size: object.size,
    }))
    .filter((part) => part.name.length > 0);
  return {
    relativeNames: relative.map((part) => part.name),
    topLevel: relative.filter((part) => !part.name.includes('/')),
  };
};

/**
 * Plan a cache-safe reprocess from the objects stored under a video's base path:
 * pick the reprocess source (remux a stored `.ts`, or recover from stored fMP4
 * parts) and the fresh `v<N>/` output dir every output lands under. `toUrl`
 * turns a storage path into the download URL the remux reads — the compute route
 * and the CLI differ only in how they build that URL, so the rest of the glue
 * lives here once (SWO-639).
 *
 * @throws (via {@link planReprocessSource}) when nothing recoverable is stored.
 */
const planReprocess = (
  objects: StoredObject[],
  basePath: string,
  toUrl: (storagePath: string) => string,
): { source: RepackageSource; outputStoragePath: string } => {
  const { relativeNames, topLevel } = toStoredParts(objects, basePath);
  const outputStoragePath = `${basePath}/${nextVersionDir(relativeNames)}`;
  const plan = planReprocessSource(topLevel);
  const source: RepackageSource =
    plan.kind === 'hls-ts'
      ? { kind: 'hls-url', url: toUrl(`${basePath}/${PLAYLIST_NAME}`) }
      : {
          kind: 'fmp4-parts',
          partUrls: plan.partNames.map((name) => toUrl(`${basePath}/${name}`)),
        };
  return { source, outputStoragePath };
};

export { planReprocess, toStoredParts, PLAYLIST_NAME };
export type { StoredObject };
