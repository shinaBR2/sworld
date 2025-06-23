import type { Request, Response, NextFunction } from 'express';
import type { Context, Next } from 'hono';
import { type ZodError, type ZodSchema, z } from 'zod';
import { ServiceResponse } from '../schema';

// Framework-agnostic validation context
interface ValidationContext {
  params: Record<string, string>;
  query: Record<string, any>;
  body: any;
  headers: Record<string, string>;
}

// Framework-agnostic validation result
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pure validation logic (framework-independent)
const validateData = <T>(schema: ZodSchema<T, any, any>, context: ValidationContext): ValidationResult<T> => {
  try {
    const validated = schema.parse(context);
    return {
      success: true,
      data: validated,
    };
  } catch (err) {
    const errorMessage = `Invalid input: ${formatZodError(err as ZodError)}`;
    return {
      success: false,
      error: errorMessage,
    };
  }
};

const formatZodError = (error: ZodError): string => {
  return error.errors
    .map(err => {
      const path = err.path
        .map(p => {
          if (p === 'headers') return 'Header';
          if (typeof p === 'string') return p;
          return `[${p}]`;
        })
        .join(' ');

      if (err.message === 'Required') {
        return `${path} is required`;
      }

      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(', ');
};

// Express wrapper
const expressValidateRequest = <T>(schema: ZodSchema<T, any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const context: ValidationContext = {
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers as Record<string, string>,
    };

    const result = validateData(schema, context);

    if (result.success) {
      (req as any).validatedData = result.data;
      next();
    } else {
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: result.error!,
        dataObject: null,
      };
      res.status(200).json(serviceResponse);
    }
  };
};

// Hono wrapper
const honoValidateRequest = <T>(schema: ZodSchema<T, any, any>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const query = Object.fromEntries(new URL(c.req.url).searchParams);
      const params = c.req.param();
      const headers = Object.fromEntries(c.req.raw.headers);

      const context: ValidationContext = {
        params,
        query,
        body,
        headers,
      };

      const result = validateData(schema, context);

      if (result.success) {
        (c as any).validatedData = result.data;
        await next();
      } else {
        const serviceResponse: ServiceResponse<null> = {
          success: false,
          message: result.error!,
          dataObject: null,
        };
        return c.json(serviceResponse, 200);
      }
    } catch (err) {
      const serviceResponse: ServiceResponse<null> = {
        success: false,
        message: 'Failed to parse request',
        dataObject: null,
      };
      return c.json(serviceResponse, 200);
    }
  };
};

// Export the appropriate validator based on framework
const validateRequest = expressValidateRequest; // Start with Express
// const validateRequest = honoValidateRequest // Switch to Hono later

// Types for compatibility
type ValidatedRequest<T extends z.ZodType> = Request & { validatedData: z.infer<T> };
type ValidatedContext<T extends z.ZodType> = Context & { validatedData: z.infer<T> };

export {
  validateRequest,
  expressValidateRequest,
  honoValidateRequest,
  validateData, // Pure function for testing
  type ValidationContext,
  type ValidationResult,
  type ValidatedRequest,
  type ValidatedContext,
};
