const videoConfig = {
  defaultConcurrencyLimit: 5,
  essentialHLSTags: new Set([
    '#EXTM3U',
    '#EXT-X-VERSION',
    '#EXT-X-TARGETDURATION',
    '#EXT-X-MEDIA-SEQUENCE',
    '#EXT-X-ENDLIST',
  ]),
  excludePatterns: [/\/adjump\//, /\/ads\//, /\/commercial\//],
  maxFileSize: 4 * 1024 * 1024 * 1024, // 4GiB
  ffmpegCommands: [
    '-c:v',
    'libx264', // Video codec: H.264
    '-profile:v',
    'high', // H.264 profile
    '-level:v',
    '4.1', // H.264 level
    '-preset',
    'medium', // Encoding preset (slower = better quality)
    // SWO-638 production encode profile. CRF alone (constant quality) preserved
    // the ~20-30 Mbps raw-camera source bitrate, which stalled mid-playback
    // (~11-12s) because the player couldn't build a startup buffer off GCS. A
    // VBV cap bounds the peak bitrate while keeping CRF's quality-first
    // behaviour below it.
    '-crf',
    '23', // quality target (raised from 18 — the VBV cap now bounds the peak)
    '-maxrate',
    '4M', // VBV: cap the peak bitrate so GCS delivery keeps ahead of playback
    '-bufsize',
    '8M', // VBV buffer (2x maxrate) — smooths the rate over ~2s
    // Never-upscale cap to a 1080p long edge, orientation-safe (landscape OR
    // portrait): fit inside a min(1920,iw) x min(1920,ih) box preserving aspect
    // ratio, keeping dimensions even for yuv420p. Inputs already <=1080p pass
    // through untouched (force_original_aspect_ratio=decrease never upscales).
    '-vf',
    "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
    // Force a keyframe every 4s so HLS segment cuts land on keyframes (matches
    // -hls_time 4 below) — clean, independently seekable segments.
    '-force_key_frames',
    'expr:gte(t,n_forced*4)',
    '-pix_fmt',
    'yuv420p', // Pixel format for compatibility
    '-c:a',
    'aac', // Audio codec: AAC
    '-b:a',
    '192k', // Audio bitrate
    '-ac',
    '2', // Audio channels (stereo)
    '-ar',
    '48000', // Audio sample rate
    '-f',
    'hls', // Output format: HLS
    '-hls_time',
    '4', // Segment duration in seconds
    '-hls_list_size',
    '0', // Include all segments in the playlist
    // fMP4/CMAF output (init.mp4 + .m4s + #EXT-X-MAP) instead of MPEG-TS .ts.
    // The init segment carries the AAC config upfront, sidestepping hls.js's
    // MPEG-TS AAC-demux race (the "Gosick" garbled-audio bug on desktop Chrome).
    // Free here because convert already transcodes. See src/docs/fmp4-default-output.
    //
    // The init filename is RELATIVE on purpose — ffmpeg writes it into the
    // segment directory (which convertToHLS pins absolute via
    // `-hls_segment_filename`). An ABSOLUTE init path here gets mis-joined and
    // fails ("Failed to open segment"). The `.m4s` SEGMENT filename is NOT set
    // here at all: a relative one would write segments to the process CWD, so
    // convertToHLS sets it as an absolute path inside the output dir.
    '-hls_segment_type',
    'fmp4',
    '-hls_fmp4_init_filename',
    'init.mp4',
  ],
};

export { videoConfig };
