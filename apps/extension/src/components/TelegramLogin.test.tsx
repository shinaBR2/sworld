import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramLogin } from './TelegramLogin';

// Route each background action type to a canned response.
let responses: Record<string, unknown>;
const sendMessage = vi.fn((msg: { type: string }, cb: (r: unknown) => void) =>
  cb(responses[msg.type]),
);

// In-memory stand-in for chrome.storage.local, backing the persisted "code sent"
// step (SWO-604). Reset per test so cases don't leak the flag into each other.
let store: Record<string, string>;

beforeEach(() => {
  responses = {
    TELEGRAM_REQUEST_LOGIN_CODE: { success: true, message: 'sent' },
    TELEGRAM_SUBMIT_LOGIN_CODE: { success: true, message: 'ok' },
  };
  sendMessage.mockClear();
  store = {};
  global.chrome = {
    runtime: { id: 'test-ext', sendMessage },
    storage: {
      local: {
        get: vi.fn(async (keys: string[]) => {
          const out: Record<string, string> = {};
          for (const key of keys) {
            if (key in store) out[key] = store[key];
          }
          return out;
        }),
        set: vi.fn(async (items: Record<string, string>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (keys: string[]) => {
          for (const key of keys) delete store[key];
        }),
      },
    },
  } as unknown as typeof chrome;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TelegramLogin', () => {
  it('sends a code, then accepts a submitted code and notifies the parent', async () => {
    const onAuthenticated = vi.fn();
    render(<TelegramLogin onAuthenticated={onAuthenticated} />);

    // Step 1: send code — the code field only appears after that succeeds.
    const sendButton = await screen.findByRole('button', {
      name: 'Send login code',
    });
    expect(screen.queryByLabelText('Login code')).toBeNull();
    fireEvent.click(sendButton);

    const codeInput = await screen.findByLabelText('Login code');
    fireEvent.change(codeInput, { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TELEGRAM_SUBMIT_LOGIN_CODE',
        payload: { code: '12345' },
      }),
      expect.any(Function),
    );
  });

  it('restores the code-entry step when a code was already sent', async () => {
    // Simulate the popup being reopened after the user left to read the code:
    // the persisted flag must take them straight to the code field, without
    // re-requesting a code.
    store.telegramLoginCodeSent = 'true';
    render(<TelegramLogin onAuthenticated={vi.fn()} />);

    expect(await screen.findByLabelText('Login code')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Send login code' }),
    ).toBeNull();
    expect(sendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TELEGRAM_REQUEST_LOGIN_CODE' }),
      expect.any(Function),
    );
  });

  it('persists the sent step and clears it once login succeeds', async () => {
    const onAuthenticated = vi.fn();
    render(<TelegramLogin onAuthenticated={onAuthenticated} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Send login code' }),
    );

    const codeInput = await screen.findByLabelText('Login code');
    await waitFor(() => expect(store.telegramLoginCodeSent).toBe('true'));

    fireEvent.change(codeInput, { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    expect(store.telegramLoginCodeSent).toBeUndefined();
  });

  it('still notifies the parent when the post-login cleanup write fails', async () => {
    // The login already succeeded server-side, so a rejected storage cleanup
    // must not swallow that success and strand the user on the code step.
    (chrome.storage.local.remove as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('storage unavailable'),
    );
    const onAuthenticated = vi.fn();
    render(<TelegramLogin onAuthenticated={onAuthenticated} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Send login code' }),
    );
    const codeInput = await screen.findByLabelText('Login code');
    fireEvent.change(codeInput, { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
  });

  it('returns to the send step and clears the flag when asked for a new code', async () => {
    store.telegramLoginCodeSent = 'true';
    render(<TelegramLogin onAuthenticated={vi.fn()} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Send a new code' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Send login code' }),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Login code')).toBeNull();
    expect(store.telegramLoginCodeSent).toBeUndefined();
  });

  it('shows an error and stays on the code step when the code is rejected', async () => {
    responses.TELEGRAM_SUBMIT_LOGIN_CODE = {
      success: false,
      message: 'INVALID_CODE',
    };
    const onAuthenticated = vi.fn();
    render(<TelegramLogin onAuthenticated={onAuthenticated} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Send login code' }),
    );
    const codeInput = await screen.findByLabelText('Login code');
    fireEvent.change(codeInput, { target: { value: '00000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('INVALID_CODE')).toBeTruthy();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('shows an error when the code could not be sent', async () => {
    responses.TELEGRAM_REQUEST_LOGIN_CODE = {
      success: false,
      message: 'MISCONFIGURED',
    };
    render(<TelegramLogin onAuthenticated={vi.fn()} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Send login code' }),
    );

    expect(await screen.findByText('MISCONFIGURED')).toBeTruthy();
    expect(screen.queryByLabelText('Login code')).toBeNull();
  });
});
