enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

enum TaskType {
  CONVERT = 'convert',
  IMPORT_PLATFORM = 'import_platform',
  STREAM_HLS = 'stream_hls',
  /** ONE TIME JOB TO FIX VIDEO HAS MISSING DURATION  */
  FIX_DURATION = 'fix_duration',
  /** ONE TIME JOB TO FIX VIDEO HAS MISSING THUMBNAIL  */
  FIX_THUMBNAIL = 'fix_thumbnail',
  SHARE = 'share',
  CRAWL = 'crawl',
  /** REMUX A STORED TS VIDEO INTO FMP4/CMAF TO FIX THE HLS.JS NOISE BUG */
  REPAIR_FMP4 = 'repair_fmp4',
}

enum TaskEntityType {
  VIDEO = 'video',
  CRAWL_VIDEO = 'crawl_video',
}

export { TaskEntityType, TaskStatus, TaskType };
