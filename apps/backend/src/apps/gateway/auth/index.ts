import { Hono } from 'hono';
import { deviceRequestCreateSchema } from 'src/schema/auth/device';
import { requestHandler } from 'src/utils/handlers';
import { zodValidator } from 'src/utils/validators/zodValidator';
import { createDeviceRequest } from './routes/device';

const authRouter = new Hono();

authRouter.post(
  '/device',
  zodValidator('json', deviceRequestCreateSchema),
  requestHandler(createDeviceRequest),
  // requestHandler(async (context) => {
  //   const { validatedData } = context;
  //   const { ip, userAgent } = validatedData;
  //   const { extensionId } = validatedData.input.input;

  //   const data = await createDeviceRequest({ extensionId, ip, userAgent });

  //   return {
  //     success: true,
  //     message: 'ok',
  //     dataObject: data,
  //   };
  // }),
);

export { authRouter };
