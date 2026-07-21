interface CrawlData {
  videoUrl: string;
}

interface CrawlParams {
  getSingleVideo: boolean;
  title: string;
  slugPrefix: string;
  userId: string;
}

export type { CrawlData, CrawlParams };
