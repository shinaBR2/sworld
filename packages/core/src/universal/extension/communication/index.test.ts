import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyExtension } from './index';

describe('notifyExtension', () => {
  // Store the original chrome object to restore it after tests
  const originalChrome = global.chrome;

  // Mock chrome.runtime
  const mockSendMessage = vi.fn(
    (_id: string, _message: any, callback: () => void) => {
      callback();
    },
  );

  const mockRuntime = {
    sendMessage: mockSendMessage,
    lastError: null as Error | null,
  };

  // Set up and clean up chrome mock before/after tests
  beforeEach(() => {
    // @ts-expect-error - Mocking chrome object
    global.chrome = {
      runtime: {
        ...mockRuntime,
        sendMessage: vi.fn(mockSendMessage),
      },
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore the original chrome object
    global.chrome = originalChrome;
    vi.restoreAllMocks();
  });

  it('should send a message to the extension when chrome.runtime is available', () => {
    const testId = 'test-extension-id';
    const testType = 'TEST_MESSAGE';
    const testData = { key: 'value' };

    notifyExtension({
      id: testId,
      type: testType,
      data: testData,
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      testId,
      {
        type: testType,
        data: testData,
      },
      expect.any(Function),
    );
  });

  it('should not throw when chrome is not defined', () => {
    // @ts-expect-error - Remove chrome for this test
    delete global.chrome;

    expect(() => {
      notifyExtension({
        id: 'test-id',
        type: 'TEST',
        data: {},
      });
    }).not.toThrow();
  });

  it('should not throw when chrome.runtime is not available', () => {
    // @ts-expect-error - Remove runtime for this test
    global.chrome = {};

    expect(() => {
      notifyExtension({
        id: 'test-id',
        type: 'TEST',
        data: {},
      });
    }).not.toThrow();
  });

  it('should handle errors when sending message fails', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = new Error('Failed to send message');

    // Mock sendMessage to set lastError and call callback
    // @ts-expect-error - Override mock for this test
    chrome.runtime = {
      sendMessage: (_id: string, _message: any, callback: () => void) => {
        chrome.runtime.lastError = error;
        callback();
      },
      lastError: null as Error | null,
    };

    notifyExtension({
      id: 'test-id',
      type: 'TEST_ERROR',
      data: { error: true },
    });

    expect(consoleSpy).toHaveBeenCalledWith('Extension not available');
    consoleSpy.mockRestore();
  });

  it('should work without data parameter', () => {
    const testId = 'test-extension-id';
    const testType = 'TEST_NO_DATA';

    notifyExtension({
      id: testId,
      type: testType,
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      testId,
      {
        type: testType,
        data: undefined,
      },
      expect.any(Function),
    );
  });
});
