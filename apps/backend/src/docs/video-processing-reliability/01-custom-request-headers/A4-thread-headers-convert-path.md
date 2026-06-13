# A4 — Thread custom headers through the convert (mp4) path

**Repo:** sworld-backend
**Type:** feature
**Status:** todo
**Estimate:** M
**Blocked by:** A0, A1
**Blocks:** Z1
**Parallel-safe with:** A2, A3 (disjoint files)

## Context

The `video` (mp4/mov/m4v/ts) path downloads the source via `downloadFile` and may
fetch for the thumbnail — both headerless. Hotlink-protected direct files 403 in
prod. Thread `customRequestHeaders` through this path too.

## Scope

- `convertVideo` (convert handler) reads `customRequestHeaders` (A1) and passes
  it to `downloadFile`.
- `downloadFile` (`helpers/file`) accepts optional `headers` and applies
  `buildRequestHeaders(custom)` to its fetch.
- Apply the same to any fetch in `helpers/thumbnail` used by this path.

## Files to touch (ownership)

- `src/services/videos/convert/handler.ts`
- `src/services/videos/helpers/file/index.ts`
- `src/services/videos/helpers/thumbnail/index.ts`
- `src/schema/videos/convert/index.ts` — **handler-schema fields only; do NOT edit the shared `videoDataSchema`/`transformEvent` (A1 owns those).** If this risks a conflict with A1, sequence A4 after A1 merges.

## Acceptance criteria

- [ ] `downloadFile` sends default UA + `customRequestHeaders`.
- [ ] A hotlink-protected `.mp4` downloads when the video has the right `Referer`.
- [ ] No headers → unchanged (plus default UA).
- [ ] `pnpm type-check` clean; convert handler tests pass.

## Test plan

- Local convert run against a header-gated direct file.

## Out of scope

- HLS / subtitle paths.

> ⚠️ Shared-file note: `schema/videos/convert/index.ts` is A1's foundation file.
> A4 only consumes the headers in the handler. If both must edit it, A4 waits for
> A1 to land (already a dependency).
