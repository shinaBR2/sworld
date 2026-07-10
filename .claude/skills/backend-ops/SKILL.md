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

- **`~/.sworld-cli/config.json`**: `gcp-key` (service-account JSON at `/Users/tranvanvuong/Projects/sworld/cli.json`), `gcp-bucket` (`sworld-prod.appspot.com`), `hasura-endpoint` (`https://free-lamprey-59.hasura.app/v1/graphql`), `hasura-secret` (admin), `user-id` (see aliases above — override, don't trust the default).
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
- **No audio CLI exists** — for audios, write a one-off `tsx` script that reads `~/.sworld-cli/config.json`, uploads the mp3 to `audios/<userId>/<file>.mp3` via `@google-cloud/storage`, then `insert_audios_one` via Hasura admin (GraphQL field names: `artistName`, `user_id`, `source`, `name`, `public`). A reusable `audio.ts` CLI would be a nice follow-up. Full CLI docs: `sworld-backend/src/cli/README.md`.

## Recurring task: "create audios"

The owner's most common recurring ops ask: they have local `.mp3` files and ask to "create new audios." Just do it — don't explain the plumbing (GCS, CLI scripts, pipeline) unless asked; keep it simple.

**The flow for each mp3:**

1. Owner = **shinabr2** by default.
2. `name` + `artistName` from the filename — usually `Title - Artist.mp3`. Only ask if genuinely ambiguous; `artist_name` is NOT NULL so it must be set.
3. `public: false` by default — see the `security-reviewer` skill's Hasura reference for why only the admin/DB owner may ever set `public: true`.
4. Upload the mp3 to GCS `audios/<shinabr2-id>/<slug>.mp3` and `insert_audios_one` via Hasura admin (one-off `tsx` script; no audio CLI yet).
5. Quick dup-check by name+user first; verify the public URL returns 200 after.

Batches are common (a folder of mp3s).

## Third-party video imports (javhd/JAV, Wishlist SWO-118 "Videos" comments)

- Stream CDN is `sf16-sg.tiktokcdn.top`; it hotlink-checks Referer/Origin against the source site's domain — pass `--referer https://javhdz.im` to `stream-m3u8.ts` (also covers `--thumbnail` fetches, which reuse `--referer`).
- Use **`javhdz.im`**, not `javhdz.ws` — `.ws` is DNS-sinkholed and TLS/SNI-blocked on this network; `.im` is a live mirror serving the same `/data/<code>.jpg` thumbnails and is accepted by the CDN as Referer too.
- Video codes (e.g. `FNS-224`) become the video `title`/`slug`; playlists are actress names, usually already existing (find by id given in the comment, don't recreate by slug lookup unless no id is given).
