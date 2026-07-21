import type { Context, Next } from 'hono';
import { CustomError } from 'src/utils/custom-error';
import { envConfig } from 'src/utils/envConfig';
import { VALIDATION_ERRORS } from 'src/utils/error-codes';
import { validateSignature } from './validator';

export const validateHashnodeSignature = () => {
  return async (c: Context, next: Next) => {
    try {
      const signatureHeader = c.req.header('x-hashnode-signature');

      if (!signatureHeader) {
        throw new Error('Missing x-hashnode-signature header');
      }

      // Get the raw body as string for signature verification
      const body = await c.req.raw.clone().text();
      const payload = JSON.parse(body);

      const validationResult = validateSignature({
        incomingSignatureHeader: signatureHeader,
        payload,
        secret: envConfig.hashnodeWebhookSecret as string,
      });

      if (!validationResult.isValid) {
        throw CustomError.high('Invalid signature', {
          shouldRetry: false,
          errorCode: VALIDATION_ERRORS.INVALID_SIGNATURE,
          context: {
            reason: validationResult.reason,
            body,
          },
          source: 'utils/validators/validateHashnodeSignature/index.ts',
        });
      }

      await next();
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.high('Invalid request', {
        shouldRetry: false,
        errorCode: VALIDATION_ERRORS.INVALID_SIGNATURE,
        originalError: error as Error,
      });
    }
  };
};
