import type { Readable } from 'node:stream';

/** A single HLS segment after parsing/ad-stripping. */
interface HlsSegment {
  url: string;
  name: string;
  duration?: number;
}

interface ParsedManifest {
  /** Rewritten playlist content (ads stripped, segments renamed). */
  modifiedContent: string;
  segments: {
    included: HlsSegment[];
    excluded: HlsSegment[];
  };
  /** Total duration of included segments, rounded to whole seconds. */
  duration: number;
  /**
   * The fMP4 init segment (`#EXT-X-MAP`), present only for fMP4/CMAF sources.
   * The caller fetches + uploads it alongside the `.m4s` segments. Undefined for
   * MPEG-TS (`.ts`) sources.
   */
  init?: HlsSegment;
}

/** Minimal `fetch`-like response the core consumes (satisfied by `fetchWithError`). */
interface HttpResponse {
  text(): Promise<string>;
  body: ReadableStream<Uint8Array> | null;
  status: number;
  statusText: string;
}

interface HttpRequestInit {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Dependency ports the core is given by its adapter (io handler / CLI). The core
 * imports none of these implementations — that's what makes it framework- and
 * env-agnostic and unit-testable with fakes.
 */
interface StoragePort {
  /** Upload a readable stream to `storagePath` with the given content type. */
  uploadStream(params: {
    stream: Readable;
    storagePath: string;
    contentType: string;
  }): Promise<unknown>;
  /** Public download URL for a stored object. */
  getDownloadUrl(storagePath: string): string;
}

interface HttpPort {
  fetch(url: string, init?: HttpRequestInit): Promise<HttpResponse>;
}

interface ThumbnailPort {
  /**
   * Generate a thumbnail from a segment and return its download URL, or
   * `undefined` if generation fails (best-effort — must not throw).
   */
  generateFromSegment(params: {
    url: string;
    duration: number;
    storagePath: string;
    customRequestHeaders?: Record<string, string>;
  }): Promise<string | undefined>;
}

interface LoggerPort {
  info(obj: unknown, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
  error(obj: unknown, msg?: string): void;
}

interface ProcessStreamDeps {
  storage: StoragePort;
  http: HttpPort;
  thumbnail: ThumbnailPort;
  logger: LoggerPort;
}

interface ProcessStreamInput {
  /** Source M3U8 playlist URL. */
  sourceUrl: string;
  /** Base storage path for the playlist + segments (e.g. `videos/<user>/<id>`). */
  storagePath: string;
}

interface ProcessStreamOptions {
  excludePatterns?: RegExp[];
  concurrencyLimit?: number;
  /** Per-source request headers (e.g. Referer) for playlist + segment fetches. */
  customRequestHeaders?: Record<string, string>;
  /** Parse + preview only — resolve/parse but skip the thumbnail and uploads. */
  dryRun?: boolean;
}

interface ProcessStreamResult {
  playlistUrl: string;
  duration: number;
  thumbnailUrl?: string;
  segments: ParsedManifest['segments'];
  /** The rewritten playlist content (handy for dry-run previews). */
  modifiedContent: string;
}

/**
 * One produced fMP4 file (the init segment or a media segment), as a lazily
 * opened readable so a whole video never has to sit in memory at once.
 */
interface Fmp4Artifact {
  /** Object name relative to the video's storage path, e.g. `init.mp4`, `0.m4s`. */
  name: string;
  stream: Readable;
}

/** What an fMP4 remux produced from a source HLS playlist. */
interface Fmp4Artifacts {
  /** The single shared init segment (`init.mp4`). */
  init: Fmp4Artifact;
  /** The media segments (`*.m4s`). */
  segments: Fmp4Artifact[];
  /**
   * The fMP4 playlist text ffmpeg wrote (contains `#EXT-X-MAP`). The repair
   * engine returns this for the caller (P2) to swap into `playlist.m3u8`; the
   * engine itself never writes the shared playlist name.
   */
  playlistContent: string;
}

interface RepackageOutput {
  artifacts: Fmp4Artifacts;
  /** Release any temp resources the adapter created (e.g. its temp dir). */
  cleanup: () => Promise<void>;
}

/**
 * Where a reprocess reads its media from. Both variants produce a clean fMP4 via
 * a lossless `-c copy` remux (SWO-639):
 * - `hls-url`: remux an HLS playlist URL directly (a stored `.ts` playlist).
 * - `fmp4-parts`: download the given fMP4 object URLs, concatenate them, and
 *   remux the result — recovers a broken fMP4 (the Infinix case: a media-bearing
 *   `init.mp4` + an empty first `.m4s`) whose playlist ffmpeg can't read directly.
 */
type RepackageSource =
  | { kind: 'hls-url'; url: string }
  | { kind: 'fmp4-parts'; partUrls: string[] };

/**
 * Port that turns a {@link RepackageSource} into fMP4/CMAF artifacts — no video
 * transcode. The real implementation (fluent-ffmpeg + a temp dir) is the
 * adapter's; the engine only sees this interface, which keeps it env-agnostic
 * and unit-testable with a fake.
 */
interface RepackagePort {
  repackageToFmp4(source: RepackageSource): Promise<RepackageOutput>;
}

interface RepackageDeps {
  /** Reuses the existing storage port (read URL + upload). */
  storage: StoragePort;
  repackage: RepackagePort;
  logger: LoggerPort;
}

interface RepackageInput {
  /** The media to remux (a stored `.ts` playlist URL, or fMP4 parts to concat). */
  source: RepackageSource;
  /**
   * Versioned directory ALL outputs (init, segments, manifest) are written
   * under, e.g. `videos/<user>/<id>/v2`. A fresh `v<N>/` per reprocess is what
   * makes the fix cache-safe — it never overwrites a 1-year-cached object.
   */
  outputStoragePath: string;
}

interface RepackageResult {
  /** Uploaded init object name (relative to `outputStoragePath`). */
  initName: string;
  /** Uploaded `.m4s` object names (relative to `outputStoragePath`). */
  segmentNames: string[];
  /**
   * Full storage path of the uploaded manifest, e.g.
   * `videos/<user>/<id>/v2/playlist.m3u8`. The caller repoints `videos.source`
   * at this object's download URL.
   */
  manifestStoragePath: string;
}

export type {
  HlsSegment,
  ParsedManifest,
  HttpResponse,
  HttpRequestInit,
  StoragePort,
  HttpPort,
  ThumbnailPort,
  LoggerPort,
  ProcessStreamDeps,
  ProcessStreamInput,
  ProcessStreamOptions,
  ProcessStreamResult,
  Fmp4Artifact,
  Fmp4Artifacts,
  RepackageOutput,
  RepackageSource,
  RepackagePort,
  RepackageDeps,
  RepackageInput,
  RepackageResult,
};
