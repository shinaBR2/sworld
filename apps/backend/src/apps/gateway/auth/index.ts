import { Hono } from 'hono';
import { deviceRequestCreateSchema } from 'src/schema/auth/device';
import { honoRequestHandler } from 'src/utils/requestHandler';
import { honoValidateRequest } from 'src/utils/validators/request';
import { createDeviceRequest } from './routes/device';

const authRouter = new Hono();

/**
 * curl command for local test
 * curl -X POST 'http://localhost:4000/auth/device' \
  -H 'Content-Type: application/json' \
  -H 'x-hasura-action: createDeviceRequest' \
  -d '{
    "body": {
      "action": {
        "name": "createDeviceRequest"
      },
      "input": {
        "input": {
          "extensionId": "your-extension-id-here"
        }
      }
    },
    "headers": {
      "content-type": "application/json",
      "x-hasura-action": "createDeviceRequest"
    },
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }'
 */
authRouter.post(
  '/device',
  honoValidateRequest(deviceRequestCreateSchema),
  honoRequestHandler(createDeviceRequest),
);

export { authRouter };
