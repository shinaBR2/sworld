import { ERROR_CODES } from '@shinabr2/core/universal/errors/errorCodes';
import { getContext } from 'hono/context-storage';
import { PostHog } from 'posthog-node';
import { CustomError } from '../../utils/custom-error';
import { envConfig } from '../../utils/envConfig';
import { getCurrentLogger } from '../../utils/logger';
import type { Env } from '../../utils/types/context';

/**
 * Reference
 * - https://cloud.google.com/error-reporting/docs/formatting-error-messages#log-error
 * - https://cloud.google.com/error-reporting/reference/rest/v1beta1/projects.events/report#reportederrorevent
 * - https://hasura.io/docs/2.0/actions/action-handlers/#returning-an-error-response
 */
const { errorTracker } = envConfig;

const errorHandler = (error: unknown) => {
  const logger = getCurrentLogger();

  const context = getContext<Env>();
  const userId = context?.var?.userId;
  const hasuraAction = context?.var?.hasuraAction;
  const hasuraEventTrigger = context?.var?.hasuraEventTrigger;

  /**
   * TODO
   * Calcuate from context
   * - Hasura Action: always 400
   * - Hasura Event Trigger: 400 or 200 based on shouldRetry
   * - Stripe Webhook: 400 or 200 based on shouldRetry
   * - Cloud Tasks: 400 or 200 based on shouldRetry
   */
  const statusCode = 400;

  if (error instanceof CustomError) {
    logger.debug(`🎯 shouldRetry: ${error.shouldRetry}`);
    logger.debug(`🎯 Status code: ${statusCode}`);
    /**
     * This is case when somewhere in the lower stack,
     * we EXPLICITLY throw CustomError with shouldNotify = true
     *
     * We must notify the team knows
     * and return status code 500
     * to let client retry
     */
    if (error.shouldNotify) {
      logger.error({
        err: error,
        message: error.message,
        metadata: {
          userId,
          hasuraAction,
          hasuraEventTrigger,
        },
      });

      return {
        result: error.toUserResponse(),
        statusCode,
      };
    }

    // TODO: call posthog anayltics

    if (errorTracker.posthogPublicKey) {
      try {
        const posthog = new PostHog(errorTracker.posthogPublicKey, {
          host: errorTracker.posthogHost,
        });
        posthog.captureException(error, userId);
        // https://posthog.com/docs/error-tracking/installation/hono
        posthog.shutdown();
      } catch (error) {
        // This will trigger GCP Error Reporting
        logger.error(error, 'Failed to send error to PostHog');
      }
    }

    return {
      result: error.toUserResponse(),
      statusCode,
    };
  }

  /**
   * Cases
   * - Legacy code we didn't cover
   * - Native database operation (we don't need to try catch in code)
   * - Any code that throw native Error object
   *
   * We must notify the team knows
   *
   * TODO
   * Need a way to distinguish between Hasura Action and other events
   * (Hasura event trigger, Stripe webhook events, Cloud Tasks Handler)
   * to return different status code
   * For now, when this case happen, it always return status code 400
   * which means it will ALWAYS retry
   */
  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        message: error.message,
        metadata: {
          userId,
          hasuraAction,
          hasuraEventTrigger,
        },
      },
      'Unexpected error',
    );

    return {
      result: {
        // error: "Internal Server Error",
        message: error.message,
        extensions: {
          code: ERROR_CODES.UNEXPECTED_ERROR,
          shouldRetry: true,
        },
      },
      statusCode,
    };
  }

  /**
   * This SHOULD NEVER happen
   * We should ALWAYS throw Error object or its extension
   * Throwing something else definitely developer mistake
   * We should NOT let client retry
   */
  const developerError = new Error('Developer mistake');
  logger.error(developerError, 'Developer mistake');

  return {
    result: {
      error: 'Internal Server Error',
      message: developerError.message,
    },
    statusCode: 200, // DO NOT RETRY AT ALL COST
  };
};

export { errorHandler };
