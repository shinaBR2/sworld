# A2 — Thread custom headers through the HLS path

**Repo:** sworld-backend
**Type:** feature
**Status:** todo
**Estimate:** M
**Blocked by:** A0, A1
**Blocks:** Z1
**Parallel-safe with:** A3, A4 (disjoint files)

## Context

The `.m3u8` (stream-hls) path fetches the playlist + every `.ts` segment with no
headers, so hotlink-protected sources 403 in prod. Thread the video's
`customRequestHeaders` (via A0's `buildRequestHeaders`) into those fetches.

## Scope

- `streamHLSHandler` reads `customRequestHeaders` from its validated data (A1)
  and passes it down into `streamM3U8`.
- `streamM3U8` forwards headers to `parseM3U8Content`, `streamSegmentFile`,
  `streamSegments`, and the thumbnail fetch.
- Each `fetchWithError(...)` in `m3u8/helpers.ts` gets
  `headers: buildRequestHeaders(customRequestHeaders)`.

## Files to touch (ownership)

- `src/apps/io/videos/routes/stream-hls/index.ts`
- `src/schema/videos/stream-hls/index.ts` (carry `customRequestHeaders` through, derived from A1's shared schema)
- `src/services/videos/helpers/m3u8/index.ts`
- `src/services/videos/helpers/m3u8/helpers.ts`

## Acceptance criteria

- [ ] Playlist + segment fetches send the default UA + any `customRequestHeaders`.
- [ ] A hotlink-protected master/media URL that needs a `Referer` processes
      successfully when `metadata.customRequestHeaders.Referer` is set.
- [ ] No headers set → behaviour unchanged except the default UA is now sent.
- [ ] Unit tests updated; `pnpm type-check` clean.

## Test plan

- Reuse the known case (`vn03.quaivat.com` + `Referer: https://phimnhua.online/`)
  against a local run; confirm segments fetch (no 403).

## Out of scope

- subtitle / convert paths (A3 / A4).
- Editing the shared `videoDataSchema` (A1 owns it).
