import { Hono } from 'hono';
import { hasuraWebhookSchema } from 'src/schema/hasura';
import { convertSchema } from 'src/schema/videos/convert';
import { crawlSchema } from 'src/schema/videos/crawl';
import { shareSchema } from 'src/schema/videos/share';
import { subtitleCreatedSchema } from 'src/schema/videos/subtitle-created';
import { requestHandler } from 'src/utils/handlers';
import { zodValidator } from 'src/utils/validators/zodValidator';
import { crawlHandler } from './routes/crawl';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';
import { sharePlaylistHandler } from './routes/share-playlist';
import { shareVideoHandler } from './routes/share-video';
import { streamToStorage } from './routes/stream-to-storage';
import { subtitleCreatedHandler } from './routes/subtitle-created';

const videosRouter = new Hono();

videosRouter.post(
  '/convert',
  zodValidator('json', convertSchema),
  requestHandler(streamToStorage),
);

videosRouter.post(
  '/fix-videos-duration',
  zodValidator('json', hasuraWebhookSchema),
  requestHandler(fixVideosDuration),
);
videosRouter.post(
  '/fix-videos-thumbnail',
  zodValidator('json', hasuraWebhookSchema),
  requestHandler(fixVideosThumbnail),
);
videosRouter.post(
  '/crawl',
  zodValidator('json', crawlSchema),
  requestHandler(crawlHandler),
);
videosRouter.post(
  '/share-playlist',
  zodValidator('json', shareSchema),
  requestHandler(sharePlaylistHandler),
);
videosRouter.post(
  '/share-video',
  zodValidator('json', shareSchema),
  requestHandler(shareVideoHandler),
);
videosRouter.post(
  '/subtitle-created',
  zodValidator('json', subtitleCreatedSchema),
  requestHandler(subtitleCreatedHandler),
);

export { videosRouter };
