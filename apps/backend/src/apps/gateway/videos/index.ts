import express, { type Router } from 'express';
import { validateRequest } from 'src/utils/validator';
import { validateRequest as newValidateRequest } from 'src/utils/validators/request';
import { crawlHandler } from './routes/crawl';
import { fixVideosDuration } from './routes/fix-videos-duration';
import { fixVideosThumbnail } from './routes/fix-videos-thumbnail';
import { streamToStorage } from './routes/stream-to-storage';
import {
  type HasuraWebhookRequest,
  hasuraWebhookSchema,
} from 'src/schema/hasura';
import { type ConvertRequest, convertSchema } from 'src/schema/videos/convert';
import { type CrawlRequest, crawlSchema } from 'src/schema/videos/crawl';
import { type ShareRequest, shareSchema } from 'src/schema/videos/share';
import { sharePlaylistHandler } from './routes/share-playlist';
import { shareVideoHandler } from './routes/share-video';
import {
  type SubtitleCreatedRequest,
  subtitleCreatedSchema,
} from 'src/schema/videos/subtitle-created';
import { requestHandler } from 'src/utils/requestHandler';
import { subtitleCreatedHandler } from './routes/subtitle-created';

const videosRouter: Router = express.Router();

videosRouter.post(
  '/convert',
  validateRequest<ConvertRequest>(convertSchema),
  streamToStorage,
);
videosRouter.post(
  '/fix-videos-duration',
  validateRequest<HasuraWebhookRequest>(hasuraWebhookSchema),
  fixVideosDuration,
);
videosRouter.post(
  '/fix-videos-thumbnail',
  validateRequest<HasuraWebhookRequest>(hasuraWebhookSchema),
  fixVideosThumbnail,
);
videosRouter.post(
  '/crawl',
  validateRequest<CrawlRequest>(crawlSchema),
  crawlHandler,
);
videosRouter.post(
  '/share-playlist',
  validateRequest<ShareRequest>(shareSchema),
  sharePlaylistHandler,
);
videosRouter.post(
  '/share-video',
  validateRequest<ShareRequest>(shareSchema),
  shareVideoHandler,
);
videosRouter.post(
  '/subtitle-created',
  newValidateRequest<SubtitleCreatedRequest>(subtitleCreatedSchema),
  requestHandler(async (context) => {
    const { validatedData } = context;
    const result = await subtitleCreatedHandler(validatedData);

    return {
      success: true,
      message: 'ok',
      dataObject: result,
    };
  }),
);
// videosRouter.post(
//   '/test',
//   newValidateRequest(shareSchema),
//   requestHandler(async context => {
//     const { validatedData } = context;

//     console.log(`validatedData`, validatedData);
//     return {
//       success: true,
//       message: 'ok',
//       dataObject: validatedData,
//     };
//   })
// );

export { videosRouter };
