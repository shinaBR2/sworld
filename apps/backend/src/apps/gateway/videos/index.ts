import express, { Router } from 'express';
import { envConfig } from 'src/utils/envConfig';
import { AppError, AppResponse } from 'src/utils/schema';
import { validateRequest } from 'src/utils/validator';
import { logger } from 'src/utils/logger';
import { ConvertRequest } from '../../../services/videos/convert';
import { ConvertSchema } from '../../../services/videos/convert/schema';
import { createCloudTasks } from '../../../utils/cloud-task';
import { verifySignature } from '../../../services/videos/convert/validator';

const videosRouter: Router = express.Router();

videosRouter.post(
  '/convert',
  validateRequest<ConvertRequest>(ConvertSchema),
  async (req: any, res) => {
    const { validatedData } = req;
    const { signatureHeader, event } = validatedData;
    const { metadata } = event;

    if (!verifySignature(signatureHeader)) {
      throw AppError('Invalid webhook signature for event', {
        eventId: metadata.id,
      });
    }

    if (!envConfig.computeServiceUrl) {
      throw AppError('Missing environment variable: computeServiceUrl', {
        eventId: metadata.id,
      });
    }

    try {
      const task = await createCloudTasks({
        url: `${envConfig.computeServiceUrl}/videos/convert-handler`,
        queue: 'convert-video',
        payload: event,
      });

      return res.json(AppResponse(true, 'ok', task));
    } catch (error) {
      throw AppError('Failed to create conversion task', {
        eventId: metadata.id,
        error,
      });
    }
  }
);

export { videosRouter };
