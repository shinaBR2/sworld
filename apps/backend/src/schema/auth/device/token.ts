import { z } from 'zod';

const getDeviceTokenSchema = z
  .object({
    body: z.object({
      action: z.object({
        name: z.string(),
      }),
      input: z.object({
        input: z.object({
          deviceCode: z.string(),
          grantType: z.string(),
        }),
      }),
    }),
    headers: z.looseObject({
      'content-type': z.string(),
      'x-hasura-action': z.string(),
    }),
    ip: z.string(),
    userAgent: z.string().optional(),
  })
  .transform((req) => ({
    action: req.body.action,
    input: req.body.input,
    deviceCode: req.body.input.input.deviceCode,
    grantType: req.body.input.input.grantType,
    hasuraActionHeader: req.headers['x-hasura-action'],
    contentTypeHeader: req.headers['content-type'],
    ip: req.ip,
    userAgent: req.userAgent,
  }));

export type GetDeviceTokenRequest = z.infer<typeof getDeviceTokenSchema>;
export { getDeviceTokenSchema };
