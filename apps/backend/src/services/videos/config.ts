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
};

export { videoConfig };
