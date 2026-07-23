import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramLogin } from './TelegramLogin';

// Route each background action type to a canned response.
let responses: Record<string, unknown>;
const sendMessage = vi.fn((msg: { type: string }, cb: (r: unknown) => void) =>
  cb(responses[msg.type]),
);

beforeEach(() => {
  responses = {
    TELEGRAM_REQUEST_LOGIN_CODE: { success: true, message: 'sent' },
    TELEGRAM_SUBMIT_LOGIN_CODE: { success: true, message: 'ok' },
  };
  sendMessage.mockClear();
  global.chrome = {
    runtime: { id: 'test-ext', sendMessage },
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
    expect(screen.queryByLabelText('Login code')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Send login code' }));

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

  it('shows an error and stays on the code step when the code is rejected', async () => {
    responses.TELEGRAM_SUBMIT_LOGIN_CODE = {
      success: false,
      message: 'INVALID_CODE',
    };
    const onAuthenticated = vi.fn();
    render(<TelegramLogin onAuthenticated={onAuthenticated} />);

    fireEvent.click(screen.getByRole('button', { name: 'Send login code' }));
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

    fireEvent.click(screen.getByRole('button', { name: 'Send login code' }));

    expect(await screen.findByText('MISCONFIGURED')).toBeTruthy();
    expect(screen.queryByLabelText('Login code')).toBeNull();
  });
});
