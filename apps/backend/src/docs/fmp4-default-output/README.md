# Epic: one processing core, fMP4/CMAF output

**Two goals, sequenced:**

1. **Deduplicate.** The stream-processing logic exists **twice** today — in the
   io handler *and* re-implemented inline in the CLI (`src/cli/stream-m3u8.ts`).
   Extract it into **one injectable core**; the io handler and the CLI become
   thin adapters that inject their own deps (storage, http, hasura client).
2. **Switch to fMP4.** With the logic in one place, flip its packaging from
   MPEG-TS (`.ts`) to **fMP4/CMAF** (`init.mp4` + `.m4s`, `#EXT-X-MAP`) — every
   caller gets it at once.

This folder is our "Linear" for this epic. Each sub-feature is a folder; each
micro-PR is one markdown file. Pick any ticket whose **Blocked by** is satisfied
and ship it in one small PR. **Status lives in the folder and file names.**

---

## Why this is two steps

The fMP4 fix is small, but doing it *well* means fixing the duplication first —
otherwise we'd change the same logic in two places (again). So:

- **Refactor first** (extract core, behavior-preserving — still `.ts`). Safe,
  reviewable, no user-visible change.
- **Behavior change second** (core emits fMP4). Isolated, easy to verify/revert.

This keeps the foundation independent of the feature.

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

The **frontend needs no change** (hls.js already plays fMP4; PR #290's
`hls.js@1.5.20` pin is good hygiene but was not the fix).

## ffmpeg recipe (reference, used by the core's packaging step)

```bash
ffmpeg -i <source> -c:v copy -c:a aac -b:a 128k -ac 2 -ar 44100 \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 \
  -hls_segment_filename "%d.m4s" playlist.m3u8
```

---

## Waves

| Wave | Folder | Tickets |
| - | - | - |
| Extract core (refactor, still `.ts`) | `00.todo.extract-core` | **F1** extract injectable core + io handler calls it · **F2** CLI calls the core (delete the replica) |
| Switch to fMP4 (behavior) | `01.todo.switch-to-fmp4` | **P1** core emits fMP4 (io + CLI get it) · **P2** convert path emits fMP4 (shared packaging) |
| Verify | `02.todo.verify` | **V1** fMP4 + dedup tests |
| Deferred | `03.deferred.catalog-migration` | **G1** migrate existing `.ts` catalog |

Order: **F1 → F2 → P1 (+ P2) → V1**. `G1` deferred.

## The target shape

```
core: processStream(input, opts, deps)   ← ONE implementation
        deps = { storage, http, hasura, logger, ids }
        emits fMP4 (init.mp4 + .m4s)
  ├── io stream-hls handler  → thin adapter, injects backend deps (envConfig client, GCS, fetchWithError)
  └── CLI stream-m3u8        → thin adapter, injects local deps (~/.sworld-cli, local GCS key)
convert (mp4→HLS)            → own transcode, reuses the core's packaging+upload+finalize
```

## Status

```
ls src/docs/fmp4-default-output/**/
```
