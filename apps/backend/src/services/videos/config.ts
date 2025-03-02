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
    '-map 0:v', // Video streams
    '-map 0:a', // Audio streams
    '-map 0:s:0?', // First subtitle stream
    '-codec copy', // Copy codec without re-encoding
    '-codec:s webvtt', // Convert subtitles to WebVTT
    '-start_number 0', // Start segment numbering at 0
    '-hls_time 10', // 10 second segment duration
    '-hls_list_size 0', // Keep all segments in playlist
    '-f hls', // HLS output format
  ],
};

export { videoConfig };
