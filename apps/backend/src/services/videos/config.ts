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
    'slow', // Encoding preset (slower = better quality)
    '-crf',
    '18', // Constant Rate Factor (lower = higher quality)
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
    '-hls_segment_filename',
    'segment_%03d.ts', // Segment filename pattern
  ],
};

export { videoConfig };
