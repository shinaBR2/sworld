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
}

interface ProcessStreamResult {
  playlistUrl: string;
  duration: number;
  thumbnailUrl?: string;
  segments: ParsedManifest['segments'];
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
};
