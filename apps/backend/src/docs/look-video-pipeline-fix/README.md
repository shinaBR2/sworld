# Epic: Look video pipeline fix — correct, stream-ready HLS for every input

**Goal:** make the video convert pipeline produce correct, stream-ready HLS for
every input we actually feed it — and prove it — so no Look (or Watch
web-download) video freezes at ~4–5s, stalls mid-playback, or fails to play.

This folder is our "Linear" for this epic (mirrors `../fmp4-default-output/`).
The README is the **shared definition of done**: what a correct conversion looks
like, and the exact test corpus every downstream ticket validates against.
**Status lives in the folder and file names.** Tickets: **SWO-633** (parent) ·
**SWO-635** (this doc) · **SWO-636/637/638/639** (the waves below).

Root-cause evidence: Linear document *"Look video HLS empty first segment — root
cause"* (Look project).

---

## Why — two independent encode defects

The whole Look library (180/180 videos) was unplayable. Two separate faults, both
baked into the stored files by the shared convert pipeline:

1. **Empty first segment.** The pipeline runs **ffmpeg 4.4** (bundled by
   `@ffmpeg-installer/ffmpeg`). Its fMP4/CMAF HLS muxer emits a spurious empty
   first segment (`0.m4s` = 24 bytes, zero frames) while the playlist still lists
   it with a real duration → players stall at the first segment boundary
   (long clips freeze ~4–5s; short clips never play). Verified: ffmpeg **7.1.1**
   fixes it.
2. **Unbounded bitrate → mid-playback stall.** The convert flags use `-crf 18`
   with no `-maxrate`/`-bufsize`. CRF is constant *quality*, so raw phone-camera
   footage (~20–30 Mbps) is preserved at full bitrate; served direct from GCS
   (no CDN) the player can't build a startup buffer and stalls once (~11–12s)
   before catching up. Web-sourced videos never hit this (already ~0.6 Mbps) —
   Look was the first raw-camera input.

The fix lands in the **one shared pipeline** every convert path uses (compute
convert service, local ingest CLI, Watch web-downloads, Look uploads).

## Plain-English walkthrough of the fixed behaviour

A user imports or converts a video. The player shows the first frame immediately
and plays start-to-finish — no ~4–5s freeze, no ~11–12s buffering pause. Short
clips play. This holds for raw phone-camera footage and for web-downloaded videos
alike.

---

## The verification corpus

Assembled here, **reused by every downstream ticket**. Samples live outside the
repo (scratchpad / GCS) — we do **not** commit media fixtures; the existing unit
tests mock ffmpeg. This section is the manifest of what must be exercised.

| # | Class | Properties to cover | Why it's in the corpus |
| - | - | - | - |
| C1 | Raw phone-camera, short | single-segment | the previously-dead short-clip case |
| C2 | Raw phone-camera, long | many segments | the ~4–5s freeze case |
| C3 | Raw phone-camera, portrait | rotation metadata | orientation-safe scaling |
| C4 | Raw phone-camera, high-bitrate | ~20–30 Mbps | the ~11–12s mid-playback stall |
| C5 | Web-download (Watch flow) | VP9 / AV1, variable frame rate, rotated, TikTok/ibyteimg-style muxing, ~0.6 Mbps | ffmpeg 7 must stay a superset of 4.4 on input support — validated, not assumed |
| C6 | Infinix-style layout | media-bearing `init.mp4` + empty `0.m4s` | regression sample + the lossless-remux repair path |

**Out of scope:** videos flagged `keepOriginalSource` / `skip_process` are never
transcoded (they proxy the external URL), so they're excluded from every check.

---

## Definition of done — the checklist every downstream ticket validates against

- [ ] First segment is real content (>24 B) and decodes; every listed segment decodes.
- [ ] No ~4–5s freeze; no ~11–12s mid-playback stall on a raw-camera sample (C4).
- [ ] Every web-download corpus item (C5) converts and plays cleanly — no regression vs ffmpeg 4.4.
- [ ] No regression of the MPEG-TS AAC-demux "Gosick" audio bug (we stay on fMP4 — see `../fmp4-default-output/`).
- [ ] **Local Docker build gate:** `docker build -f apps/backend/Dockerfile.compute .` succeeds; inside the resulting `linux/amd64` image `ffmpeg -version` is ≥7, the binary is executable, and a sample convert runs end-to-end (real first segment).
- [ ] A re-processed video gets fresh (versioned) URLs and its `source` is repointed, so a fix is visible immediately despite the 1-year object cache.

The **Docker gate** is load-bearing, not a formality: `ffmpeg-static` ships a
different binary per platform, so a host/macOS check does **not** prove the
production binary. And because a merge auto-deploys the compute service to Cloud
Run (`.github/workflows/backend-prod-compute.yml`), a broken image would ship to
prod on merge — the gate catches it first.

---

## Waves

Each edge is a real `blocks`/`blocked-by` relation in Linear.

```
SWO-635 (this doc) ─▶ SWO-636 ─▶ SWO-637 ─▶ SWO-638
                                     └─────▶ SWO-639
```

| Wave | Ticket | What ships |
| - | - | - |
| Goal & verification | **SWO-635** | this README (corpus + done checklist) |
| Validate the binary | **SWO-636** | run the corpus through ffmpeg ≥7 **inside a locally-built compute image**; go/no-go on the exact version |
| Swap the binary | **SWO-637** | replace `@ffmpeg-installer/ffmpeg` (4.4) with `ffmpeg-static` (≥7) across the shared helper + both `repair-fmp4` paths; `Dockerfile.compute` `chmod`; kills the empty first segment |
| Encode profile | **SWO-638** | VBV cap `-crf 23 -maxrate 4M -bufsize 8M`, never-upscale ≤1080p scale, `-force_key_frames` — kills the mid-playback stall |
| Cache-safe reprocess | **SWO-639** | versioned output names (init/segments **and** manifest) + repoint `source`; re-transcode and lossless-remux paths |

SWO-638 and SWO-639 both wait on the binary swap (SWO-637); their *development*
may overlap it, but they validate/ship against the fixed binary.

## The two-defect fix, at a glance

```
BEFORE (broken):
  ffmpeg 4.4  → empty 0.m4s (24 B)            → freeze at first segment
  -crf 18, no VBV cap → ~30 Mbps off GCS      → mid-playback stall (~11–12s)

AFTER (this epic):
  ffmpeg ≥7 (ffmpeg-static)                   → real first segment      [SWO-637]
  -crf 23 -maxrate 4M -bufsize 8M + ≤1080p    → streamable off GCS       [SWO-638]
  versioned URLs + repoint source on reprocess → fix visible past cache  [SWO-639]
```

## Interim repair (already done, out of this epic's scope)

All 180 previously-broken videos were re-generated with ffmpeg 7 and
user-confirmed playing (2026-07-27) via throwaway scratchpad scripts — 132 Xiaomi
re-transcoded from local originals, 48 Infinix losslessly remuxed from stored
segments. No library items remain broken. This epic is the **productionised**
pipeline + reprocess path for the next time, not that one-off repair.
