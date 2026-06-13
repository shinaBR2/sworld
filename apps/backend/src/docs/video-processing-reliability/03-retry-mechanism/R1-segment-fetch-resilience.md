# R1 — Segment/subtitle fetch resilience (per-item retry + source-error handling)

**Repo:** sworld-backend
**Type:** feature (resilience)
**Status:** todo
**Estimate:** S
**Blocked by:** None (independent of F1)
**Blocks:** —
**Parallel-safe with:** B1, B3, C1 — **but shares files with A2 (m3u8) and A3 (subtitle); sequence after them or fold the retry into those PRs.**

## Context — discovered in the field

While manually processing the X-Files batches, two real bugs in the streaming
path surfaced (fixed in the CLI `src/cli/stream-m3u8.ts`; the **backend has the
identical flaws** and they are a likely cause of stuck `processing` videos):

1. **No per-segment retry.** One dropped connection (`BodyTimeoutError`,
   `SocketError: other side closed`) aborts the *entire* video, discarding all
   prior segments. Intermittent CDN drops therefore fail whole jobs.
2. **Source-stream errors are unhandled.** In `streamSegmentFile`
   (`m3u8/helpers.ts`) and `streamSubtitleFile` (`subtitle/index.ts`) the error
   handler is only on the GCS write stream:
   `Readable.fromWeb(response.body).pipe(writeStream).on('error', reject)`.
   `pipe()` does **not** forward *source* errors — so a socket drop on the
   incoming body becomes an **unhandled `'error'` event that crashes the process**
   (it never becomes a rejected promise, so any retry can't catch it).

## Scope

- In `streamSegmentFile` (and `streamSubtitleFile`): replace the bare
  `Readable.fromWeb(body).pipe(writeStream)` with **`stream.pipeline()`**
  (`node:stream/promises`). `pipeline()` forwards source errors (body/socket
  drops) as a rejection **and** tears down both streams — instead of leaving an
  unhandled source `'error'` that crashes the process. (Matches the CLI fix.)
- Add a small `withRetry(fn, label, attempts, backoff)` helper and wrap each
  segment fetch+upload (and the subtitle fetch) — retry transient
  network/socket/timeout errors (e.g. 4 attempts, linear backoff). Do not retry
  on a clean 4xx (won't change).
- Mirror the exact fix already shipped in `src/cli/stream-m3u8.ts`
  (`uploadSegment` source-error handling + `withRetry` in `uploadSegments`).

## Files to touch (ownership)

- `src/services/videos/helpers/m3u8/helpers.ts` (shared with A2 — coordinate)
- `src/services/videos/helpers/subtitle/index.ts` (shared with A3 — coordinate)
- `src/utils/retry/withRetry.ts` (new) + test

## Acceptance criteria

- [ ] A simulated source-stream error rejects the promise (no process crash).
- [ ] A transient failure retries and succeeds; a persistent one fails after N.
- [ ] A 270-segment HLS source with intermittent drops completes (proven for the
      CLI; replicate behaviour server-side).

## Test plan

- Unit: mock a body that errors mid-stream → assert reject + retry, not crash.

## Out of scope

- Re-firing the whole job (C1) / header injection (A-path) — orthogonal.

> Field reference: CLI commit fixing both issues in `src/cli/stream-m3u8.ts`
> (`uploadSegment` + `withRetry`). The backend should match it.
