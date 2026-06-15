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
 * Port that reads an HLS source URL and remuxes it to fMP4/CMAF — no video
 * transcode. The real implementation (fluent-ffmpeg + a temp dir) is the
 * adapter's (P2); the engine only sees this interface, which keeps it
 * env-agnostic and unit-testable with a fake.
 */
interface RepackagePort {
  repackageToFmp4(sourceUrl: string): Promise<RepackageOutput>;
}

interface RepackageDeps {
  /** Reuses the existing storage port (read URL + upload). */
  storage: StoragePort;
  repackage: RepackagePort;
  logger: LoggerPort;
}

interface RepackageInput {
  /** Base storage path of the already-streamed video, e.g. `videos/<user>/<id>`. */
  storagePath: string;
}

interface RepackageResult {
  /** Uploaded init object name (relative to `storagePath`). */
  initName: string;
  /** Uploaded `.m4s` object names (relative to `storagePath`). */
  segmentNames: string[];
  /** fMP4 playlist text for the caller to swap into `playlist.m3u8` (P2). */
  playlistContent: string;
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
  RepackagePort,
  RepackageDeps,
  RepackageInput,
  RepackageResult,
};
