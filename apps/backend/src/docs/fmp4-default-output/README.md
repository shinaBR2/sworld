# Epic: one processing core + on-demand fMP4 repair

**Two goals, sequenced:**

1. **Deduplicate.** *(done)* The stream-processing logic existed **twice** — in
   the io handler *and* re-implemented inline in the CLI. It's now **one
   injectable core** (`src/services/videos/processing/`); the io handler and the
   CLI are thin adapters that inject their own deps (storage, http, hasura).
2. **On-demand fMP4 repair.** Add a **manually-triggered repair tool** that
   repackages a *single, already-streamed* video from MPEG-TS (`.ts`) to
   fMP4/CMAF (`init.mp4` + `.m4s`, `#EXT-X-MAP`) — run **only when** a video
   turns out noisy (the Gosick case). The default streaming flow is **left
   exactly as-is**.

This folder is our "Linear" for this epic. Each sub-feature is a folder; each
micro-PR is one markdown file. Pick any ticket whose **Blocked by** is satisfied
and ship it in one small PR. **Status lives in the folder and file names.**

---

## What we are NOT doing (important)

This epic was originally scoped as "flip every path to fMP4 by default." **That
is no longer the plan.** Decisions that now govern this epic:

- **The streaming flow stays untouched.** m3u8 → storage still copies `.ts`
  segments byte-for-byte. It's the cheap, default, **main** flow and it works
  fine for almost everything. We do **not** make it run ffmpeg, and we do **not**
  probe/detect audio inside it.
- **The convert flow (mp4 → HLS) stays untouched** too, for now.
- **No automatic detection.** A video streams in as `.ts`, goes `ready`, and a
  **human** judges noise by watching it on the frontend. That's the trigger.
- **fMP4 is a repair, not a default.** We only pay the heavy ffmpeg-repackage
  cost on the rare videos that actually need it, when we choose to.

Why: turning the streaming flow into "always download + ffmpeg + re-upload" would
trade a lightweight byte-shuttle for a full transcode-shaped pipeline on **every**
video, to fix a bug that only **some** fragile sources hit. Not worth it. A
targeted, on-demand repair fixes the real problem without taxing the common path.

## The incident this came from

The "Gosick" playlist played **intermittent garbled/noise audio on desktop
Chrome** (hls.js), while files were byte-perfect and fine on iOS/native/ffmpeg.
Root cause: hls.js's **MPEG-TS AAC-demux race** — in `.ts`, the AAC
`AudioSpecificConfig` isn't delivered cleanly, so the player reconstructs it on
the fly while demuxing, and that races MSE setup. When it loses, the decoder
gets a broken profile (`media-internals`: `codec: aac, profile: unknown …
Unknown sample format`) → noise, no hard error, flaky (pause/resume sometimes
fixes it). ffmpeg shows the same fault copying that ADTS to MP4:
`Malformed AAC bitstream detected: use 'aac_adtstoasc'`.

**Proven fix:** serve **fMP4/CMAF** — the config lives in the init segment,
delivered once upfront, so there's no live reconstruction and no race. A
single-instance hls.js test of the *same content* as fMP4 played clean on
desktop + mobile + emulation; as `.ts` it was noisy. The remux is `-c:v copy` +
a light audio step — **no video transcode**.

The bug is about the **container/framing**, not corrupt data — so repackaging the
`.ts` we **already stored** (which is the source audio, byte-for-byte) into fMP4
fixes it. We do **not** need the original third-party URL.

The **frontend needs no change** (hls.js already plays fMP4; PR #290's
`hls.js@1.5.20` pin is good hygiene but was not the fix).

## How the repair reads its input

The repair reads the **`.ts` we already saved in our own GCS bucket**
(`videos/{userId}/{id}/`), **not** the original source URL. Reasons:

- We **own** those bytes — they don't expire, don't need a `referer`, don't
  depend on a third party. A Gosick-type video is usually noticed long after the
  original link has rotated/expired, so re-fetching the original is the *least*
  reliable input exactly when we need it.
- The streaming flow copies segments **byte-for-byte**, so our stored `.ts` *is*
  the original audio (minus ads). Same input quality, far higher availability.

## ffmpeg recipe (reference, used by the repair's repackage step)

The incident was fixed with an audio **re-encode** (regenerates a clean
`AudioSpecificConfig`, sidesteps the malformed-source case entirely):

```bash
ffmpeg -i <stored-playlist.m3u8> -c:v copy -c:a aac -b:a 128k -ac 2 -ar 44100 \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 \
  -hls_segment_filename "%d.m4s" playlist.m3u8
```

`-c:v copy` = no video transcode. (`-c:a copy -bsf:a aac_adtstoasc` is the
cheaper, lossless alternative, but it *reuses* the source's audio config — which
is the very thing that's malformed on the offending sources. Re-encode is the
proven-clean default; revisit only if it proves unnecessary.)

---

## Status: shipped ✅

The on-demand fMP4 repair is **live and validated on PROD** — a real noisy Gosick
segment was streamed to `.ts`, repaired to fMP4 via `repair-fmp4.ts`, and
confirmed to play clean in desktop Chrome. See `src/cli/` for the tool.

| Wave | Folder | Tickets |
| - | - | - |
| Extract core (refactor, still `.ts`) — **done** | `00.done.extract-core` | **F1** extract injectable core + io handler calls it · **F2** CLI calls the core (delete the replica) |
| On-demand fMP4 repair — **done** | `01.todo.on-demand-fmp4-repair` | **P1** fMP4 repackage engine (stored `.ts` → fMP4) · **P2** CLI repair command (fresh-URL publish + `source` repoint) |
| Verify — **skipped** | `02.todo.verify` | **V1** repair tests — covered by P1 unit tests + manual PROD validation |
| Deferred | `03.deferred.catalog-migration` | **G1** batch-repair fragile videos (reuses P2) |

Order was **P1 → P2 → V1**; V1 was skipped (see its ticket). `G1` stays deferred —
pick up only if enough videos surface the noise to make one-by-one repair
impractical. The default streaming/convert flows were **never** part of any wave —
they stay as-is.

## The target shape

```
EXISTING, UNCHANGED:
  core: processStream(input, opts, deps)   ← copies .ts byte-for-byte (default)
    ├── io stream-hls handler  → thin adapter (GCS, fetchWithError)
    └── CLI stream-m3u8        → thin adapter (local GCS key)
  convert (mp4→HLS)            → own transcode, emits .ts

NEW, ADDITIVE (this epic):
  repackageToFmp4(input, deps)             ← P1: stored .ts → init.mp4 + .m4s
    └── CLI repair <videoId>   → P2: read GCS .ts → repackage → safe swap-in
```

## Status

```
ls src/docs/fmp4-default-output/**/
```
