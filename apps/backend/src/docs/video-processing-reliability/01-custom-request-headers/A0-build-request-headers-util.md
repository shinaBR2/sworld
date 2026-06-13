# A0 — `buildRequestHeaders` util (default UA + merge custom headers)

**Repo:** sworld-backend
**Type:** foundation (pure util)
**Status:** todo
**Estimate:** XS
**Blocked by:** None
**Blocks:** A2, A3, A4
**Parallel-safe with:** F1, B3

## Context

Every outbound fetch in the processing path should send a real browser
User-Agent by default (that alone defeats curl-UA blocks), plus any per-source
headers (e.g. `Referer`) from the video's `metadata.customRequestHeaders`. This
is a pure, testable function with no dependency on the schema — it can start
immediately.

## Scope

- New pure function `buildRequestHeaders(custom?: Record<string,string>): Record<string,string>`:
  - Always sets a desktop Chrome `User-Agent`.
  - Shallow-merges `custom` on top (custom wins).
  - Returns a plain headers object suitable for `fetch`/`fetchWithError`.
- Unit tests: default UA present; custom Referer merged; custom UA overrides default; `undefined`/`{}` safe.

## Files to touch (ownership)

- `src/utils/http/buildRequestHeaders.ts` (new)
- `src/utils/http/buildRequestHeaders.test.ts` (new)

## Acceptance criteria

- [ ] Returns `{ 'User-Agent': <chrome> }` when called with no args.
- [ ] `buildRequestHeaders({ Referer: 'x' })` includes both UA and Referer.
- [ ] Caller-supplied `User-Agent` overrides the default.
- [ ] Tests pass.

## Test plan

- `pnpm vitest run src/utils/http/buildRequestHeaders.test.ts`.

## Out of scope

- Wiring it into any fetch site (A2/A3/A4).
- Reading `metadata` from the event (A1).
