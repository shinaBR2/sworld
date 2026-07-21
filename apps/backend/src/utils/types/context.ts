/**
 * Shared Hono environment type definition for context storage
 * Used across the application to provide type-safe access to shared context variables
 * Reference
 * - https://hono.dev/docs/middleware/builtin/context-storage
 */
export type Env = {
  Variables: {
    userId?: string;
    hasuraAction?: string;
    hasuraEventTrigger?: string;
  };
};
