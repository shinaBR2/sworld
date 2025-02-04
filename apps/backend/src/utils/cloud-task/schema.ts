import { z } from 'zod';

const taskIdSchema = z.string().uuid();
const taskHandlerHeaderSchema = z.object({
  'content-type': z.string(),
  'x-task-id': taskIdSchema,
});

export { taskIdSchema, taskHandlerHeaderSchema };
