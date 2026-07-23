import { z } from 'zod';

// Validates the Hasura action payload for `submitTelegramLoginCode`. The login
// `code` arrives under `input.input` (the code Telegram sent to the user's own
// device); `userId` comes from the session, NEVER the request body — the code is
// only ever completed against the caller's own pending login.
const submitTelegramLoginCodeSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      input: z.object({
        input: z.object({
          code: z.string().min(1),
        }),
      }),
      session_variables: z.looseObject({ 'x-hasura-user-id': z.guid() }),
    }),
  })
  .transform((req) => ({
    code: req.body.input.input.code,
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type SubmitTelegramLoginCodeRequest = z.infer<
  typeof submitTelegramLoginCodeSchema
>;

export { submitTelegramLoginCodeSchema, type SubmitTelegramLoginCodeRequest };
