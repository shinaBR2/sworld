import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLogger = { warn: vi.fn(), error: vi.fn(), info: vi.fn() };

vi.mock('src/utils/logger', () => ({
  getCurrentLogger: () => mockLogger,
}));

vi.mock('src/utils/envConfig', () => ({
  envConfig: { slackWebhookUrl: undefined as string | undefined },
}));

import { envConfig } from 'src/utils/envConfig';
import { buildSlackPayload, postToSlack } from './index';

const WEBHOOK = 'https://hooks.slack.com/services/T000/B000/xxx';

describe('buildSlackPayload', () => {
  it('includes the title and any fields/link', () => {
    const payload = buildSlackPayload({
      title: 'Video processing failed',
      fields: { id: 'abc-123', httpStatus: 403 },
      link: { text: 'open', url: 'https://example.com/v/abc' },
    });
    const text = JSON.stringify(payload);

    expect(text).toContain('Video processing failed');
    expect(text).toContain('abc-123');
    expect(text).toContain('403');
    expect(text).toContain('https://example.com/v/abc');
  });
});

describe('postToSlack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (envConfig as { slackWebhookUrl?: string }).slackWebhookUrl = undefined;
    vi.stubGlobal('fetch', vi.fn());
  });

  it('no-ops (warns, no throw, no fetch) when the webhook is unset', async () => {
    await expect(postToSlack({ title: 'x' })).resolves.toBeUndefined();

    expect(fetch).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
  });

  it('POSTs the payload to the webhook when configured', async () => {
    (envConfig as { slackWebhookUrl?: string }).slackWebhookUrl = WEBHOOK;
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await postToSlack({ title: 'Video failed', fields: { id: 'abc' } });

    expect(fetch).toHaveBeenCalledWith(
      WEBHOOK,
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(JSON.stringify(body)).toContain('Video failed');
  });

  it('logs (does not throw) on a non-ok response', async () => {
    (envConfig as { slackWebhookUrl?: string }).slackWebhookUrl = WEBHOOK;
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });

    await expect(postToSlack({ title: 'x' })).resolves.toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });

  it('logs (does not throw) on a network error', async () => {
    (envConfig as { slackWebhookUrl?: string }).slackWebhookUrl = WEBHOOK;
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('offline'));

    await expect(postToSlack({ title: 'x' })).resolves.toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });
});
