import { envConfig } from 'src/utils/envConfig';
import { getCurrentLogger } from 'src/utils/logger';

interface SlackMessage {
  /** Bold heading line. */
  title: string;
  /** Optional label → value rows, rendered as a fields block. */
  fields?: Record<string, string | number>;
  /** Optional link rendered at the bottom. */
  link?: { text: string; url: string };
}

/**
 * Format a {@link SlackMessage} as an incoming-webhook payload (Block Kit).
 */
const buildSlackPayload = (message: SlackMessage) => {
  const { title, fields, link } = message;

  const blocks: unknown[] = [
    { type: 'section', text: { type: 'mrkdwn', text: `*${title}*` } },
  ];

  if (fields && Object.keys(fields).length > 0) {
    blocks.push({
      type: 'section',
      fields: Object.entries(fields).map(([label, value]) => ({
        type: 'mrkdwn',
        text: `*${label}:*\n${value}`,
      })),
    });
  }

  if (link) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${link.url}|${link.text}>` },
    });
  }

  return { blocks };
};

/**
 * Post a message to Slack via the configured incoming webhook.
 *
 * Never throws: if `SLACK_WEBHOOK_URL` is unset it logs a warning and returns,
 * and HTTP/network errors are logged rather than propagated — a failed alert
 * must not take down the caller (e.g. a failure-notification handler).
 */
const postToSlack = async (message: SlackMessage): Promise<void> => {
  const logger = getCurrentLogger();
  const webhookUrl = envConfig.slackWebhookUrl;

  if (!webhookUrl) {
    logger.warn(
      'SLACK_WEBHOOK_URL is not configured; skipping Slack notification',
    );
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSlackPayload(message)),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error(
        { status: response.status, body },
        'Failed to post message to Slack',
      );
    }
  } catch (error) {
    logger.error(error, 'Error posting message to Slack');
  }
};

export { buildSlackPayload, postToSlack, type SlackMessage };
