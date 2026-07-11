import { Hono } from 'hono';
import { withVideoFailureReport } from 'src/middleware/reportVideoFailure';
import { convertHandlerSchema } from 'src/schema/videos/convert';
import { repairFmp4HandlerSchema } from 'src/schema/videos/repair-fmp4-handler';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { convertHandler } from './routes/convert';
import { repairFmp4Handler } from './routes/repair-fmp4';

const videosRouter = new Hono();

videosRouter.post(
  '/convert-handler',
  honoValidateRequest(convertHandlerSchema),
  honoRequestHandler(withVideoFailureReport(convertHandler)),
);

videosRouter.post(
  '/repair-fmp4-handler',
  honoValidateRequest(repairFmp4HandlerSchema),
  honoRequestHandler(withVideoFailureReport(repairFmp4Handler)),
);

export { videosRouter };
