import { z } from 'zod';

const repairFmp4Schema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          videoId: z.guid(),
        }),
      }),
      session_variables: z.looseObject({ 'x-hasura-user-id': z.guid() }),
    }),
  })
  .transform((req) => ({
    videoId: req.body.input.input.videoId,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type RepairFmp4Request = z.infer<typeof repairFmp4Schema>;

export { repairFmp4Schema, type RepairFmp4Request };
