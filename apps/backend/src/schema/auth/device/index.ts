import { z } from 'zod';

const deviceRequestCreateSchema = z
  .object({
    body: z.object({
      action: z.object({
        name: z.string(),
      }),
      input: z.object({
        input: z.object({
          extensionId: z.string(),
        }),
      }),
    }),
    headers: z
      .object({
        'content-type': z.string(),
        'x-hasura-action': z.string(),
      })
      .passthrough(),
  })
  .transform(req => ({
    action: req.body.action,
    input: req.body.input,
    extensionId: req.body.input.input.extensionId,
    hasuraActionHeader: req.headers['x-hasura-action'],
    contentTypeHeader: req.headers['content-type'],
  }));

export type DeviceRequestCreateRequest = z.infer<typeof deviceRequestCreateSchema>;
export { deviceRequestCreateSchema };
