import { taskHandlerHeaderSchema } from 'src/utils/cloud-task/schema';
import { z } from 'zod';

// Shared shape for the Cloud Task gateway's `import` route enqueues and io's
// import handler validates — keeps both sides of the hop in lockstep.
const telegramImportTaskDataSchema = z.object({
  channelId: z.string().min(1),
  // Positive integer strings — the io handler does `Number(id)` before
  // getMessages, so a non-numeric id would become NaN. Kept in lockstep with the
  // gateway `import` action input schema.
  messageIds: z.array(z.string().regex(/^[1-9]\d*$/)).min(1),
  userId: z.guid(),
});

const telegramImportTaskMetadataSchema = z.object({
  id: z.string(),
  spanId: z.string(),
  traceId: z.string(),
});

const telegramImportTaskPayloadSchema = z.object({
  data: telegramImportTaskDataSchema,
  metadata: telegramImportTaskMetadataSchema,
});

const telegramImportHandlerSchema = z.object({
  headers: z.looseObject(taskHandlerHeaderSchema.shape),
  body: telegramImportTaskPayloadSchema,
});

type TelegramImportTaskPayload = z.infer<
  typeof telegramImportTaskPayloadSchema
>;
type TelegramImportHandlerRequest = z.infer<typeof telegramImportHandlerSchema>;

export {
  telegramImportTaskPayloadSchema,
  telegramImportHandlerSchema,
  type TelegramImportTaskPayload,
  type TelegramImportHandlerRequest,
};
