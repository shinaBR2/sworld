import { z } from 'zod';

// Validates the Hasura action payload for `requestTelegramLoginCode`. There is no
// input beyond the caller: the phone/api_id/api_hash used for `sendCode` are read
// from the calling user's own telegram_credentials row. `userId` comes from the
// session, NEVER the request body — the login always targets the caller's account.
const requestTelegramLoginCodeSchema = z
  .object({
    body: z.object({
      action: z.object({ name: z.string() }),
      session_variables: z.looseObject({ 'x-hasura-user-id': z.guid() }),
    }),
  })
  .transform((req) => ({
    userId: req.body.session_variables['x-hasura-user-id'],
  }));

type RequestTelegramLoginCodeRequest = z.infer<
  typeof requestTelegramLoginCodeSchema
>;

export { requestTelegramLoginCodeSchema, type RequestTelegramLoginCodeRequest };
