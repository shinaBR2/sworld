import express, { type Router } from 'express';
import {
  type DeviceRequestCreateRequest,
  deviceRequestCreateSchema,
} from 'src/schema/auth/device';
import { requestHandler } from 'src/utils/requestHandler';
import { validateRequest } from 'src/utils/validators/request';
import { createDeviceRequest } from './routes/device';

const authRouter: Router = express.Router();

authRouter.post(
  '/device',
  validateRequest<DeviceRequestCreateRequest>(deviceRequestCreateSchema),
  requestHandler(async (context) => {
    const { validatedData } = context;
    const { ip, userAgent } = validatedData;
    const { extensionId } = validatedData.input.input;

    const data = await createDeviceRequest({ extensionId, ip, userAgent });

    return {
      success: true,
      message: 'ok',
      dataObject: data,
    };
  }),
);

export { authRouter };
