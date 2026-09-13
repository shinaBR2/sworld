# Operator CLIs in `apps/backend/src/cli/`

Run them from `apps/backend` (that's where `tsx` and the backend's dependencies resolve), via `pnpm exec tsx src/cli/<name>.ts`. Discover each one's current flags from the CLI itself (`… <name>.ts --help`) or the full docs in `src/cli/README.md` — the per-command *purposes* below are stable, the exact flags aren't:

- **convert.ts** — local video file → fMP4 HLS, upload to GCS, create/finalize the `videos` row.
- **stream-m3u8.ts** — fix a failed video: process an `.m3u8` (master or media) → GCS, finalize an existing `videos` row. Also owns the shared CLI config (`config set`).
- **upload-subtitle.ts** — upload a `.vtt` (local or URL) → GCS, insert/update the `subtitles` row.
- **repair-fmp4.ts** — repackage a video's stored `.ts` → fMP4 (fixes garbled desktop-Chrome audio).
- **audio.ts** — publish a local `.mp3` to the listen library: no transcode, just upload verbatim to GCS + insert the `audios` row (a single file, or a whole folder). Handles dup-checking and filename metadata parsing itself.
