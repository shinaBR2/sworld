---
name: backend-ops
description: How to perform sworld operational tasks from the sworld-backend repo — GCS asset layout, operator CLIs, direct prod DB access, and the recurring "create audios" ingestion task. Auto-triggers when uploading media, ingesting mp3/video files, touching prod data directly, or working in sworld-backend/src/cli.
user-invocable: false
---

# Backend Ops

How to perform sworld operational tasks (create audios/videos, upload assets, touch prod data) from the **sworld-backend** repo (sibling to `sworld/`). This is separate from the `parallel-workflow` PR process — these are direct, already-authorized ops tasks, not feature work. Don't re-ask the user for credentials or access; they're already configured.

## User-id aliases

The owner has two sworld accounts, referred to by name instead of UUID:

- **shinabr2** → `6ff27fda-03e8-4dcd-949b-f1328f955065` — **the default account for everything.** All ops (create audios/videos, playlists, ownership) use shinabr2 unless the user explicitly names `quachtan`. Don't ask which account; assume shinabr2.
- **quachtan** / **quachtanqt** → `fe8b7813-472f-462c-a5cf-308b53009a40`

Caveat: `~/.sworld-cli/config.json`'s `user-id` currently points at **quachtan** — for any CLI/script, override it (`--user-id 6ff27fda-...` or hardcode shinabr2 in a one-off script) rather than relying on the config default.

## Assets live in GCP Cloud Storage

All media/assets are in GCS, bucket **`sworld-prod.appspot.com`**. Public URL = `https://storage.googleapis.com/sworld-prod.appspot.com/<objectPath>`.

Layout: `videos/<userId>/<videoId>/…` (HLS: `playlist.m3u8` + segments/`init.mp4`/`.m4s`), `audios/<userId>/<file>.mp3`, subtitles `videos/<userId>/<videoId>/<lang>.vtt`.

## Credentials (already configured — reuse, don't ask)

- **`~/.sworld-cli/config.json`**: `gcp-key` (path to the service-account JSON — read the value from the config, don't hardcode a path), `gcp-bucket` (`sworld-prod.appspot.com`), `hasura-endpoint` (`https://free-lamprey-59.hasura.app/v1/graphql`), `hasura-secret` (admin), `user-id` (see aliases above — override, don't trust the default).
- GCS auth: `new Storage({ keyFilename })` with that `gcp-key`. `gcloud` ADC is NOT set up — always use the key file.
- **`sworld-backend/.env`** also has: `GCP_STORAGE_BUCKET`, `HASURA_ADMIN_SECRET` + `HASURA_ENDPOINT`, `DATABASE_URL` (Neon Postgres, direct), Cloudinary, OpenAI, etc. `packages/core/.env` in the frontend repo also has `HASURA_GRAPHQL_URL` + `HASURA_ADMIN_SECRET` for quick admin queries via curl.

## Talking to the production DB directly

- Via **Hasura admin** (endpoint + admin secret above) with GraphQL — admin bypasses all row permissions. Use for reads (dup checks) and writes (insert audios rows, link playlist_audios, etc.).
- Or Neon Postgres directly via `DATABASE_URL`.

## Operator CLIs in `sworld-backend/src/cli/` (run via `npx tsx src/cli/<x>.ts`)

- **convert.ts** — local video file → fMP4 HLS, upload to GCS, create/finalize the `videos` row (`--file`, `--title`, `--video-id`, `--playlist`, `--public`, `--dry-run`, `--user-id`).
- **stream-m3u8.ts** — fix a failed video: process an `.m3u8` (master or media) → GCS, finalize an existing `videos` row (`--url`/`--file`, `--video-id`, `--referer`, `--playlist`). Also owns the shared CLI config (`config set <key> <value>`).
- **upload-subtitle.ts** — upload a `.vtt` (local or URL) → GCS, insert/update `subtitles` row.
- **repair-fmp4.ts** — repackage a video's stored `.ts` → fMP4 (fixes garbled desktop-Chrome audio).
- **audio.ts** — publish a local `.mp3` to the listen library: no transcode, just upload verbatim to GCS + insert the `audios` row (`--file <path>` or `--dir <path>` for a whole folder, `--name`/`--artist` overrides, `--public`, `--dry-run`, `--skip-db`, `--user-id`). Handles dup-checking and filename metadata parsing itself — see below. Full CLI docs: `sworld-backend/src/cli/README.md`.

## Recurring task: "create audios"

The owner's most common recurring ops ask: they have local `.mp3` files and ask to "create new audios." Just run `audio.ts` — don't explain the plumbing (GCS, CLI internals) unless asked; keep it simple.

```bash
# One file (name + artist parsed from "Title - Artist.mp3"):
npx tsx src/cli/audio.ts --file './Shape of You - Ed Sheeran.mp3' --user-id 6ff27fda-03e8-4dcd-949b-f1328f955065

# A whole folder, dry-run first:
npx tsx src/cli/audio.ts --dir ./album --user-id 6ff27fda-03e8-4dcd-949b-f1328f955065 --dry-run
```

The CLI already handles the flow the owner cares about: `name`/`artist` parsed from the filename (`artist_name` is NOT NULL — a file with no parseable artist and no `--artist` is reported and skipped, not silently defaulted), `public: false` by default (add `--public` only if explicitly asked — publishing is an act of owning the database, not a user capability, so only flip it on explicit instruction), an existing `(user_id, name)` skipped as a dup, and a `Created / Skipped / Failed` tally on a batch. Owner = **shinabr2** by default (`--user-id`, since `~/.sworld-cli/config.json`'s default points at quachtan).
