import { z } from 'zod';

const taskIdSchema = z.guid();
const taskHandlerHeaderSchema = z.object({
  'content-type': z.string(),
  'x-task-id': taskIdSchema,
});

export { taskIdSchema, taskHandlerHeaderSchema };
