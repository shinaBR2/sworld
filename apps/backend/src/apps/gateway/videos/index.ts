import { Hono } from 'hono';
import { hasuraHeadersSchema, hasuraWebhookSchema } from 'src/schema/hasura';
import { convertBodySchema } from 'src/schema/videos/convert';
import { crawlSchema } from 'src/schema/videos/crawl';
import { shareSchema } from 'src/schema/videos/share';
import { subtitleCreatedSchema } from 'src/schema/videos/subtitle-created';
import { requestHandler } from 'src/utils/handlers';
import { validateHasuraSignature } from 'src/utils/validators/validateHasuraSignature';
import { validateHeaders } from 'src/utils/validators/validateHeaders';
import { zodValidator } from 'src/utils/validators/zodValidator';
import { crawlHandler } from './routes/crawl';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';
import { sharePlaylistHandler } from './routes/share-playlist';
import { shareVideoHandler } from './routes/share-video';
import { streamToStorage } from './routes/stream-to-storage';
import { subtitleCreatedHandler } from './routes/subtitle-created';

const videosRouter = new Hono();

videosRouter.use('*', validateHeaders(hasuraHeadersSchema));
videosRouter.use('*', validateHasuraSignature());

/**
 * curl command for local test
 * curl -X POST 'http://localhost:4000/videos/convert' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-signature: <SIGNATURE>' \
  -d '{
    "event": {
      "metadata": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "span_id": "0000000000000001",
        "trace_id": "00000000000000000000000000000001"
      },
      "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "skip_process": false,
        "keep_original_source": true
      }
    }
  }'
 */
videosRouter.post(
  '/convert',
  zodValidator('json', convertBodySchema),
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
