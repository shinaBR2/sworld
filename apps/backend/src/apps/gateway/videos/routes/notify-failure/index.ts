import type { NotifyFailureRequest } from 'src/schema/videos/notify-failure';
import { postToSlack } from 'src/services/slack';
import type { HandlerContext } from 'src/utils/requestHandler';
import type { ServiceResponse } from 'src/utils/schema';

const FAILED_STATUS = 'failed';

/**
 * Handles the Hasura `status -> failed` event (B2a) by posting a readable alert
 * to Slack. The trigger fires on any `status` column change, so non-failure
 * transitions are ignored here (acceptance: no alert on ready/processing).
 */
const notifyFailureHandler = async (
  context: HandlerContext<NotifyFailureRequest>,
): Promise<ServiceResponse<{ id: string; status?: string }>> => {
  const { event } = context.validatedData;
  const { id, title, status, metadata } = event.data;

  if (status !== FAILED_STATUS) {
    return {
      success: true,
      message: 'ignored',
      dataObject: { id, status },
    };
  }

  const lastError = metadata?.lastError;

  await postToSlack({
    title: `🔴 Video processing failed: ${title}`,
    fields: {
      'Video ID': id,
      Code: lastError?.code ?? 'UNKNOWN_ERROR',
      ...(lastError?.httpStatus !== undefined
        ? { 'HTTP status': lastError.httpStatus }
        : {}),
      Reason: lastError?.message ?? 'No error detail recorded',
      Retry: `Bump retry_count for video ${id} to reprocess`,
    },
  });

  return {
    success: true,
    message: 'ok',
    dataObject: { id },
  };
};

export { notifyFailureHandler };
