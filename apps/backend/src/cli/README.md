# Video feature & manual-fix CLI tools

Everything you need to understand how sworld videos are processed, and how to
**manually fix** the two things that commonly go wrong: a video that failed to
process, and a video that is missing its subtitle.

Read this top-to-bottom once and you can pick up the whole area.

---

## 1. The big picture

sworld is split across three repos:

| Repo                | Role                                                        |
| ------------------- | ---------------------------------------------------------- |
| `sworld`            | Frontend (React).                                          |
| `sworld-hasura-v2`  | Hasura metadata + Postgres migrations (the data layer).    |
| `sworld-backend`    | Hono services that run Hasura **Actions** and **Events**.  |

A video is just a row in the `videos` table. When that row is inserted, Hasura
fires an **event trigger** that calls the backend, which downloads/copies the
media into our own Google Cloud Storage (GCS) bucket and flips the row to
`ready`. The frontend then plays it from GCS.

The CLI tools in this folder (`stream-m3u8.ts`, `upload-subtitle.ts`,
`repair-fmp4.ts`) do the **same work by hand** when the automated pipeline fails
— they are operator tools, not part of the running services. `audio.ts` is the
odd one out: audio has no automated pipeline (an mp3 needs no processing), so it
is the **only** way to publish a local audio file to the listen library.

---

## 2. Data model (the parts that matter)

### `videos` — the hub

| Column                         | Type / notes                                                              |
| ------------------------------ | ------------------------------------------------------------------------- |
| `id`                           | uuid PK                                                                    |
| `title`, `description`, `slug` | text. `slug` is `slugify(title)` (see §6).                                 |
| `video_url`                    | text NOT NULL — the **original source** URL the user submitted.           |
| `source`                       | text — the **playable** URL after processing (our GCS `playlist.m3u8`).   |
| `status`                       | text, default `'processing'`. Becomes `'ready'` when done. Plain text, **no DB enum**. |
| `duration`                     | int (seconds), filled in after processing.                                |
| `thumbnail_url` → `thumbnailUrl` | text.                                                                    |
| `s_id` → `sId`                 | text, **unique**. Short id (like a YouTube id), set at finalize.           |
| `public`                       | bool, default false. Drives anonymous visibility.                         |
| `keep_original_source` → `keepOriginalSource` | bool. If true, skip copying — play the original URL as-is (VIP).|
| `skip_process`                 | bool. If true, the pipeline does nothing.                                 |
| `user_id`                      | uuid → `users`. Owner.                                                     |

A **failed** video looks exactly like this: `status = 'processing'` and
`source = null` (it never reached finalize).

### Tables that hang off a video

```text
videos ──< video_tags >── tags          many-to-many tagging
videos ──< video_views                  per-user view events
videos ──< user_video_history           resume position (progress_seconds)
videos ──< subtitles                    captions (see §5)
videos ──< playlist_videos >── playlist  ordered playlist membership
videos ──< shared_video_recipients      direct per-user sharing
```

- **`playlist`** — `{ id, title, slug, user_id, public, thumbnail_url?, ... }`.
  Unique key: **`(user_id, slug)`** (constraint `playlist_user_id_slug_key`).
  `thumbnail_url` is nullable.
- **`playlist_videos`** — junction. PK is **`(playlist_id, video_id)`**, plus an
  integer **`position`** for ordering.
- **`subtitles`** — `{ id, video_id, user_id → userId, lang, url, url_input →
  urlInput, is_default → isDefault, ... }`. **No `title` column.**

> **GraphQL field names ≠ column names.** Hasura remaps some snake_case columns
> to camelCase (`s_id`→`sId`, `is_default`→`isDefault`, `user_id`→`userId` on
> `subtitles`, `thumbnail_url`→`thumbnailUrl`, …). When writing GraphQL, use the
> camelCase name. `video_id`, `playlist_id`, `slug`, `title`, `lang`, `url`,
> `source`, `status`, `duration` are **not** remapped.

### Who can see a video (access model)

Repeated consistently across `videos`, `subtitles`, `playlist_videos`:

1. **Owner** — `user_id = X-Hasura-User-Id`
2. **Directly shared** — appears in `shared_video_recipients` for me
3. **Shared via playlist** — in a playlist shared with me
4. **`anonymous`** — only `public = true`, reduced columns

The CLI tools use the **Hasura admin secret**, which bypasses all of this.

---

## 3. The automated processing pipeline

```text
INSERT videos row
  └─ Hasura trigger `video_on_created` → POST {BACKEND}/videos/convert
       └─ gateway `streamToStorage` (dispatcher)
            ├─ validateMediaURL(video_url)  → platform? or fileType?
            ├─ skip_process = true → no-op
            └─ enqueue a Cloud Task to ONE handler:
```

`validateMediaURL` (see `src/utils/patterns/index.ts`) classifies the URL:

| `video_url` matches                | Handler (Cloud Task) | Service   | What it does                       |
| ---------------------------------- | -------------------- | --------- | ---------------------------------- |
| `.mp4 .mov .m4v .ts`               | `convert-handler`    | compute   | ffmpeg **re-encode** → HLS         |
| `.m3u8`                            | `stream-hls-handler` | io        | **copy** existing HLS, no encode   |
| youtube / vimeo / mux / …          | `import-platform`    | io        | platform import                    |
| none of the above                  | rejected             | —         | `AppError('Invalid source')`       |

Every path ends in **`finishVideoProcess`** (`src/services/hasura/mutations/videos/finalize.ts`):
marks the Cloud Task `completed`, inserts a `video-ready` notification, and
updates the video → `{ source, status: 'ready', thumbnailUrl, duration, sId }`.

### How `.m3u8` is processed (`streamM3U8`)

`src/services/videos/helpers/m3u8/`:

1. Fetch the playlist, parse with `m3u8-parser`.
2. **Rebuild a fresh playlist**: keep non-ad segments, **rename them
   sequentially** `0.ts, 1.ts, …`, resolve each segment URL against the playlist
   URL. Ad segments (`/adjump/`, `/ads/`, `/commercial/`) are dropped.
3. Thumbnail from the first kept segment.
4. Copy the rewritten `playlist.m3u8` + all kept `.ts` into our GCS bucket.

It does **not** re-encode — stored bytes = source bytes.

### Subtitle flow

```text
INSERT subtitles row { url_input, lang, video_id, is_default }
  └─ Hasura trigger `subtitle_on_created` → POST {BACKEND}/videos/subtitle-created
       ├─ stream the file from `url_input` → GCS videos/{userId}/{videoId}/{lang}.vtt
       └─ saveSubtitle: write the GCS URL back to `subtitles.url`
```

`url_input` = raw source you give it; `url` = the final GCS URL the player uses.

---

## 4. GCS storage layout

Bucket: **`sworld-prod.appspot.com`**.

```text
videos/{userId}/{videoId}/playlist.m3u8     ← written to videos.source
videos/{userId}/{videoId}/0.ts, 1.ts, …     ← the segments
videos/{userId}/{videoId}/{name}.vtt        ← subtitle files
```

Public URL = `https://storage.googleapis.com/{bucket}/{path}`.

---

## 5. Why videos fail (and why the CLI fixes them)

Two real failure modes, both invisible to the automated pipeline:

1. **Hotlink protection (403 on segments).** Many source CDNs only serve the
   stream if the request carries a specific **`Referer`** header (the player
   page the stream was embedded on — which is a *different* host than the stream
   itself). The automated pipeline sends **no Referer**, so segment fetches
   return `403` and processing fails. → The CLI lets you pass `--referer`.

2. **Master playlists.** An `.m3u8` can be a **master** playlist (a list of
   quality variants, each pointing to another `.m3u8`) instead of a **media**
   playlist (the actual `.ts` segments). The server's `streamM3U8` only reads
   media playlists, so a master URL yields zero segments → "Empty HLS content".
   → The CLI's `resolveMasterPlaylist` detects a master and auto-picks the
   highest-bitrate variant before processing.

A **missing subtitle** is usually just the `subtitle_on_created` trigger having
failed to fetch `url_input`. → Fix with `upload-subtitle.ts`.

---

## 6. The CLI tools

Both scripts are standalone, run via `tsx`, and share one config file at
`~/.sworld-cli/config.json`. They never touch the running services.

### Owner (user-id)

The owner of every manually-created/fixed video / playlist / subtitle comes from
your **CLI config** (`user-id`), resolved `--user-id` flag > `DEFAULT_USER_ID`
env > config file. It is **required** — the tools error if it isn't set, and it
is **never** hardcoded in source. Configure it once (see setup below).

### One-time setup (GCS + Hasura auth)

GCS auth is solved with a **service-account JSON key** (`new Storage({
keyFilename })`). No `gcloud login` needed. Configure once:

```bash
npx tsx src/cli/stream-m3u8.ts config set user-id <your-user-uuid>
npx tsx src/cli/stream-m3u8.ts config set gcp-key /absolute/path/to/service-account.json
npx tsx src/cli/stream-m3u8.ts config set gcp-bucket sworld-prod.appspot.com
npx tsx src/cli/stream-m3u8.ts config set hasura-endpoint https://<your-hasura>/v1/graphql
npx tsx src/cli/stream-m3u8.ts config set hasura-secret <admin-secret>
npx tsx src/cli/stream-m3u8.ts config list      # verify (secret is masked)
```

Resolution order for every value: **CLI flag > env var > config file**.
(ADC via `gcloud auth application-default login` also works if you omit `gcp-key`.)

The key must have **write** access to the target bucket.

### `slugify` parity

Playlist matching depends on slugs. The script's `slugify` is a **byte-for-byte
replica** of the frontend's `core/universal/common` slugify (Vietnamese-aware),
so find-or-create reuses the exact rows the web app creates. If you change one,
change both.

---

### `stream-m3u8.ts` — fix a failed video

Processes an `.m3u8` (master or media) into GCS and finalizes the **existing**
video row. Optionally links it to a playlist.

```bash
# Interactive — prompts for url, video-id, referer, playlist, position:
npx tsx src/cli/stream-m3u8.ts stream

# Explicit:
npx tsx src/cli/stream-m3u8.ts stream \
  --url 'https://host/path/stream.m3u8' \
  --video-id <uuid> \
  --referer 'https://player-site.example/' \
  --playlist 'My Playlist'
```

What it does:

1. **Guard** — the `videos` row must already exist (UPDATE-only; errors if not
   found — it never creates a video).
2. **Parse** — auto-resolves master → best variant; strips ads; renames
   segments `0.ts…`.
3. **Upload** — `playlist.m3u8` + segments → `videos/{userId}/{videoId}/`.
4. **Finalize** — UPDATE video → `{ source, status: 'ready', duration, sId }`.
5. **Playlist** (if `--playlist`) — `slugify(name)` → find by `(user_id, slug)`
   → reuse if found, else create → link in `playlist_videos`. **Errors if the
   video is already in that playlist.** Position defaults to append (max+1);
   override with `--position`.

Key flags:

| Flag             | Meaning                                                           |
| ---------------- | ---------------------------------------------------------------- |
| `--url` / `--file` | Source `.m3u8` URL, or a local `.m3u8` file.                   |
| `--video-id`     | **Required.** Existing video to finalize.                        |
| `--referer`      | Sets `Referer` + `Origin` (needed for hotlink-protected CDNs).   |
| `--thumbnail`    | Image URL to re-host to GCS and set as the video's thumbnail (uses `--referer`). |
| `--playlist`     | Playlist name to find-or-create and link to.                     |
| `--position`     | Position in the playlist (default: append to end).               |
| `--standalone`   | Skip the playlist prompt (no playlist).                          |
| `--dry-run`      | Parse + show what would happen. **No uploads, no DB writes, no creds needed.** |
| `--skip-db`      | Upload to GCS but skip all Hasura writes.                        |
| `--concurrency`  | Parallel segment uploads (default 5).                            |

**Always `--dry-run` first** against a new source to confirm the segment count
and that the Referer works, before committing a multi-hundred-MB prod upload.

#### Finding the right `--referer`

It is **not** derivable from the `.m3u8` URL. Open the page where the video
actually plays → DevTools → Network → click a `.ts`/`.m3u8` request → copy its
**Referer** header. That string is your `--referer` value (often just the site
root, e.g. `https://somesite.com/`).

---

### `convert.ts` — convert a local video file to HLS

The operator-local counterpart to the compute **convert** flow (mp4 → HLS).
Point it at a **local video file**; it runs ffmpeg locally (bundled
`@ffmpeg-installer`, no system ffmpeg needed), uploads the HLS output to GCS, and
writes the `videos` row. It reuses the same ffmpeg command as the compute flow
(`videoConfig.ffmpegCommands`), so the output is the same **fMP4/CMAF**
(`playlist.m3u8` + `init.mp4` + `.m4s`) — see `src/docs/fmp4-default-output/`.

Unlike `stream-m3u8.ts` (UPDATE-only), this tool **creates the `videos` row when
it doesn't exist**, folding the manual "insert row first" step into the command.

```bash
# Create a new video from a local file (generates the row + a uuid):
npx tsx src/cli/convert.ts convert --file ./movie.mp4 --title 'Movie'

# Finalize an existing row:
npx tsx src/cli/convert.ts convert --file ./ep01.mp4 --video-id <uuid>

# Into a playlist, dry-run first:
npx tsx src/cli/convert.ts convert --file ./ep01.mp4 --title 'Tập 1' \
  --playlist 'My Series' --dry-run
```

What it does:

1. **ffprobe** the input for duration.
2. **Resolve create-vs-update** — `--video-id` that exists → finalize it;
   `--video-id` missing or omitted → **create** the row (needs `--title`;
   `slug` defaults to `slugify(title)`, `skip_process: true`, `status: processing`).
3. **Convert** the file → fMP4 HLS in a temp dir.
4. **Upload** `playlist.m3u8` + `init.mp4` + `.m4s` → `videos/{userId}/{videoId}/`
   with correct content-types.
5. **Finalize** the row → `{ source, status: 'ready', duration, sId }`.
6. **Playlist** (if `--playlist`) — find-or-create by slug and link (append by
   default; `--position` to override).

V1 scope: **local file only** (`--url` is rejected), and **no thumbnail** (a
converted video has none, like the stream CLI).

| Flag | Meaning |
| ---- | ------- |
| `--file <path>` | **Required.** Local video file. |
| `--title <title>` | Required when creating a new row. |
| `--slug <slug>` | Slug (default: `slugify(title)`). |
| `--video-id <uuid>` | Existing row to finalize; if missing, it's created with this id. |
| `--video-url <url>` | Stored as `videos.video_url` on create (default: `local:<filename>`). |
| `--public` | Mark the new video public (default: private). |
| `--playlist <name>` | Find-or-create playlist (by slug) and link. |
| `--position <n>` | Position in the playlist (default: append). |
| `--standalone` | Skip the playlist prompt. |
| `--dry-run` | Show the plan; no encode/upload/DB writes. |
| `--skip-db` | Convert + upload to GCS but skip all Hasura writes. |
| `--concurrency <n>` | Parallel segment uploads (default 5). |
| `--thumbnail <url>` | Image URL to re-host to GCS and set as the thumbnail. |
| `--thumbnail-referer <url>` | Referer for the thumbnail fetch (hotlink-protected hosts). |

Both CLIs re-host the image in our bucket (`<storagePath>/thumbnail.<ext>`) — they
never point `thumbnailUrl` at the third-party URL, which may be referer-gated or
expire.

Config is shared with `stream-m3u8.ts` (`~/.sworld-cli/config.json`); configure
it once via `stream-m3u8.ts config set <key> <value>`.

### `audio.ts` — publish a local audio file to the listen library

The audio counterpart to `convert.ts`, and far simpler: audio needs **no
transcode**. Point it at a local `.mp3`; it uploads the file verbatim to GCS and
inserts the `audios` row. No ffmpeg, no HLS, no `videos` pipeline — the mp3 is
served straight from GCS.

Unlike videos, there is no automated audio pipeline, so this CLI is the primary
way audios get into the library (not just a manual-fix fallback).

```bash
# Publish one file (name + artist parsed from "Title - Artist.mp3"):
npx tsx src/cli/audio.ts --file './Shape of You - Ed Sheeran.mp3'

# Override the parsed metadata:
npx tsx src/cli/audio.ts --file ./track.mp3 --name 'Shape of You' --artist 'Ed Sheeran'

# Publish a whole folder (one artist), dry-run first:
npx tsx src/cli/audio.ts --dir ./album --artist 'Ed Sheeran' --dry-run
```

What it does, per file:

1. **Derive metadata** — `name` + `artist` from the `Title - Artist.mp3`
   filename (`--name` / `--artist` override). `artist_name` is NOT NULL, so a
   file with no parseable artist and no `--artist` is reported and skipped.
2. **Dup-check** — an existing `(user_id, name)` is skipped (no duplicate).
3. **Upload** the mp3 → `audios/{userId}/{slug}.mp3` (`slug = slugify(name)`,
   content-type `audio/mpeg`).
4. **Insert** the `audios` row → `{ name, artistName, source, user_id, public }`,
   where `source` is the public GCS URL.

A batch (`--dir`) reports a `Created / Skipped / Failed` tally at the end; one
bad file doesn't abort the rest, and any failure makes the process exit non-zero.

V1 scope: **local mp3 only** (`--url` is rejected); playlist linking is a future
enhancement (see SWO-372).

| Flag | Meaning |
| ---- | ------- |
| `--file <path>` | Local `.mp3` to publish. Use this **or** `--dir`. |
| `--dir <path>` | Publish every `.mp3` in the folder. |
| `--name <name>` | Track name (default: parsed from filename; `--file` only). |
| `--artist <name>` | Artist (default: parsed from filename). |
| `--public` | Mark the audio public (default: private). |
| `--dry-run` | Show the plan; no uploads/DB writes, no creds needed. |
| `--skip-db` | Upload to GCS but skip the Hasura insert. |
| `--user-id <uuid>` | Owner (from `--user-id` > env > config `user-id`). |

Config is shared with `stream-m3u8.ts` (`~/.sworld-cli/config.json`); configure
it once via `stream-m3u8.ts config set <key> <value>`.

### `upload-subtitle.ts` — add a missing subtitle

Takes a `.vtt` **from a local file or a remote URL**, uploads it to GCS, and
inserts/updates the `subtitles` row.

```bash
# Interactive (prompts for source — accepts a path or a URL):
npx tsx src/cli/upload-subtitle.ts

# From a URL (downloaded, follows redirects):
npx tsx src/cli/upload-subtitle.ts --url 'https://host/path/s06e02.vtt' --video-id <uuid>

# From a local file:
npx tsx src/cli/upload-subtitle.ts --file ./ep03.vtt --video-id <uuid> --lang vi
```

What it does:

1. Guard — the video must exist.
2. Get the `.vtt` (read the local file, or download the URL) and upload it →
   `videos/{userId}/{videoId}/{name}.vtt` (`name` defaults to the source's base
   name, e.g. `s06e02`).
3. Find a `subtitles` row for `(video_id, lang)`: **update** its `url` if one
   exists, else **insert** a new row. When the source is a URL, the original URL
   is also stored in `url_input` for provenance.

| Flag           | Meaning                                                      |
| -------------- | ----------------------------------------------------------- |
| `--url`        | Remote `.vtt` URL (follows redirects). Use this **or** `--file`. |
| `--file`       | Local `.vtt` path.                                          |
| `--video-id`   | Video to attach to.                                         |
| `--lang`       | Language code (default `vi`).                               |
| `--name`       | Storage file name without extension (default: source's base name). |
| `--not-default`| Do **not** mark this as the default track (default: it is). |

### `repair-fmp4.ts` — fix a noisy video (`.ts` → fMP4)

For a video that streamed in fine and is `ready`, but plays **intermittent
garbled/noise audio on desktop Chrome** (hls.js's MPEG-TS AAC-demux race — the
"Gosick" bug). It repackages that one video's already-stored `.ts` into
**fMP4/CMAF** (`init.mp4` + `.m4s`), which delivers the audio config upfront and
kills the race. See `src/docs/fmp4-default-output/` for the full background.

It reads the `.ts` **we already own** (its public GCS playlist), so it works even
after the original source URL has expired. The normal streaming flow is
untouched — this is a targeted, on-demand repair.

```bash
# Preview what it would do (no writes):
npx tsx src/cli/repair-fmp4.ts repair --video-id <uuid> --dry-run

# Repair for real:
npx tsx src/cli/repair-fmp4.ts repair --video-id <uuid>
```

What it does (publish-then-repoint — never a broken window):

1. Look up the video → resolve its GCS path `videos/{userId}/{videoId}`.
2. ffmpeg-remux the stored playlist → fMP4 (`-c:v copy`, audio re-encoded to AAC).
3. Upload `init.mp4` + `.m4s` (new names, alongside the old `.ts`).
4. Verify `init.mp4` is in storage, write the fMP4 playlist to its **own** name
   `playlist-fmp4.m3u8` (served `no-cache`), then point `videos.source` at it.
5. Keep the old `.ts` by default (the repair stays re-runnable from the
   original). Pass `--delete-ts` to remove the superseded `.ts` + `playlist.m3u8`.

**Why a new playlist name (not an overwrite):** the original `.ts` `playlist.m3u8`
was uploaded with a **1-year `max-age`**. Overwriting that object can't reach
clients/edge caches that already hold it — they'd keep serving `.ts` for up to a
year. Publishing the fMP4 at a fresh URL and repointing `source` makes the repair
visible immediately, every time, with no cache dependency.

Then watch it on the frontend to confirm the noise is gone.

| Flag           | Meaning                                                          |
| -------------- | --------------------------------------------------------------- |
| `--video-id`   | Video to repair (required).                                     |
| `--dry-run`    | Show the plan, write nothing.                                   |
| `--delete-ts`  | Delete the old `.ts` after repair (default: keep, re-runnable). |

---

## 7. Gotchas / troubleshooting

- **403 fetching segments** → you need `--referer`. The playlist may load fine
  while segments 403 — they are guarded separately. Confirm with
  `curl -I -H 'Referer: <site>' <segment-url>`.
- **"Empty HLS content" / 0 segments** → the URL is a master playlist; the CLI
  handles it, the server pipeline does not.
- **Upload size** → the CLI copies bytes 1:1 (no re-encode). A 45-min episode at
  ~3 Mbit/s is ~1 GB; that's expected, not a bug. The only way to shrink is to
  pick a lower-bitrate variant (if the source has one) or re-encode (a different,
  slow path this tool does not do).
- **No thumbnail after a CLI fix** → `stream-m3u8.ts` sets `source/status/
  duration/sId` but **not** `thumbnailUrl` (unlike the server's HLS path, which
  thumbnails the first segment). A manually-fixed video may have no thumbnail;
  set one separately if needed.
- **`tsc` reports 3 errors in `resolveMasterPlaylist`** → pre-existing
  `m3u8-parser` type gaps. Harmless at runtime (the project runs via `tsx`,
  which skips type-checking). Left untouched on purpose.
- **Duplicate playlist created** → your `slugify` output didn't match the
  existing playlist's slug. Check the real slug
  (`playlist_by_pk(id:…){ slug }`) before running.

---

## 8. Worked example (real run)

Video `ade0…` (X-Files S6E2), source on a hotlink-protected CDN, into an
existing playlist:

```bash
npx tsx src/cli/stream-m3u8.ts stream \
  --url 'https://vn03.quaivat.com/the_x_files/s06e02/stream.m3u8' \
  --video-id 'ade0ae26-47bc-48ea-b8aa-21189c5b91ca' \
  --referer 'https://phimnhua.online/' \
  --playlist 'The X Files - season 6'
```

- Source was a **media** playlist (273 segments, 0 ads, 44.7 min).
- Segments required the `Referer` (`https://phimnhua.online/`) — without it,
  every segment 403s.
- `slugify('The X Files - season 6')` = `the-x-files-season-6`, which matched the
  existing playlist → reused, no duplicate.
- Result: ~1.1 GB copied to `videos/<userId>/ade0…/`, video → `ready`, linked
  into the playlist.
```
