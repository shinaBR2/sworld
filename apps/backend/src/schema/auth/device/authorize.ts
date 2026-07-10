import { z } from 'zod';

const authorizeDeviceSchema = z
  .object({
    body: z.object({
      action: z.object({
        name: z.string(),
      }),
      input: z.object({
        input: z.object({
          userCode: z.string(),
          approved: z.boolean(),
        }),
      }),
    }),
    headers: z.looseObject({
      'content-type': z.string(),
      'x-hasura-action': z.string(),
      'x-hasura-user-id': z.string().optional(),
      'x-hasura-role': z.string().optional(),
    }),
    ip: z.string(),
    userAgent: z.string().optional(),
  })
  .transform((req) => ({
    action: req.body.action,
    input: req.body.input,
    userCode: req.body.input.input.userCode,
    approved: req.body.input.input.approved,
    hasuraActionHeader: req.headers['x-hasura-action'],
    contentTypeHeader: req.headers['content-type'],
    hasuraUserId: req.headers['x-hasura-user-id'],
    hasuraRole: req.headers['x-hasura-role'],
    ip: req.ip,
    userAgent: req.userAgent,
  }));

export type AuthorizeDeviceRequest = z.infer<typeof authorizeDeviceSchema>;
export { authorizeDeviceSchema };
