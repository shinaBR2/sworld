import type { ExtensionMessage } from 'core/universal/extension/communication/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanupClipboardListener,
  detectContentType,
  extractUrls,
  initClipboardListener,
} from './clipboard';

const mockSendMessage = vi.fn();

vi.stubGlobal('chrome', {
  runtime: {
    sendMessage: mockSendMessage,
  },
});

const createPasteEvent = (text: string): Event => {
  const event = new Event('paste', {
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (format: string) => (format === 'text' ? text : ''),
      types: ['text/plain'],
    },
    configurable: true,
  });
  return event;
};

describe('extractUrls', () => {
  it('returns empty array for text with no URLs', () => {
    expect(extractUrls('hello world')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractUrls('')).toEqual([]);
  });

  it('returns a single URL', () => {
    expect(extractUrls('https://example.com')).toEqual(['https://example.com']);
  });

  it('returns a single URL from text with surrounding content', () => {
    expect(extractUrls('Visit https://example.com today')).toEqual([
      'https://example.com',
    ]);
  });

  it('returns multiple URLs', () => {
    expect(
      extractUrls('https://example.com and https://test.com/path?q=1'),
    ).toEqual(['https://example.com', 'https://test.com/path?q=1']);
  });

  it('handles URLs with various protocols', () => {
    expect(extractUrls('http://example.com')).toEqual(['http://example.com']);
  });
});

describe('detectContentType', () => {
  it('returns url when text is a single URL', () => {
    expect(
      detectContentType('https://example.com', ['https://example.com']),
    ).toBe('url');
  });

  it('returns text for plain text with no URLs', () => {
    expect(detectContentType('hello world', [])).toBe('text');
  });

  it('returns text for empty string', () => {
    expect(detectContentType('', [])).toBe('text');
  });

  it('returns isbn for valid ISBN-13 starting with 978', () => {
    expect(detectContentType('9781234567890', [])).toBe('isbn');
  });

  it('returns isbn for valid ISBN-13 starting with 979', () => {
    expect(detectContentType('9791234567890', [])).toBe('isbn');
  });

  it('returns isbn for ISBN-13 with hyphens stripped', () => {
    expect(detectContentType('978-3-16-148410-0', [])).toBe('isbn');
  });

  it('returns unknown for text shorter than 13 digits', () => {
    expect(detectContentType('978123456789', [])).toBe('text');
  });

  it('returns unknown for mixed content with URL and text', () => {
    expect(
      detectContentType('hello https://example.com', ['https://example.com']),
    ).toBe('unknown');
  });

  it('returns unknown for multiple URLs', () => {
    expect(
      detectContentType('https://example.com https://test.com', [
        'https://example.com',
        'https://test.com',
      ]),
    ).toBe('unknown');
  });

  it('returns isbn when text contains ISBN with label', () => {
    expect(detectContentType('isbn 9781234567890', [])).toBe('isbn');
  });
});

describe('initClipboardListener', () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
  });

  afterEach(() => {
    cleanupClipboardListener();
  });

  it('attaches a paste event listener to the document', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    initClipboardListener();
    expect(addSpy).toHaveBeenCalledWith('paste', expect.any(Function));
    addSpy.mockRestore();
  });

  it('sends USER_CLIPBOARD_ACTION message on paste with a URL', () => {
    initClipboardListener();
    document.dispatchEvent(createPasteEvent('https://example.com'));

    const expectedMessage: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'USER_CLIPBOARD_ACTION',
      payload: {
        text: 'https://example.com',
        url: 'https://example.com',
        detectedType: 'url',
      },
    };

    expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage);
  });

  it('sends USER_CLIPBOARD_ACTION message on paste with plain text', () => {
    initClipboardListener();
    document.dispatchEvent(createPasteEvent('hello world'));

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'USER_CLIPBOARD_ACTION',
        payload: expect.objectContaining({
          text: 'hello world',
          detectedType: 'text',
        }),
      }),
    );
  });

  it('does not send a message when clipboard data is empty', () => {
    initClipboardListener();
    document.dispatchEvent(createPasteEvent(''));
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('sends message with correct ExtensionMessage structure', () => {
    initClipboardListener();
    document.dispatchEvent(createPasteEvent('some text'));

    const [message] = mockSendMessage.mock.calls[0];
    expect(message).toHaveProperty('source', 'content-script');
    expect(message).toHaveProperty('target', 'background');
    expect(message).toHaveProperty('type', 'USER_CLIPBOARD_ACTION');
    expect(message).toHaveProperty('payload');
    expect(message.payload).toHaveProperty('text');
    expect(message.payload).toHaveProperty('detectedType');
  });
});

describe('cleanupClipboardListener', () => {
  it('removes the paste event listener', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    initClipboardListener();
    cleanupClipboardListener();
    expect(removeSpy).toHaveBeenCalledWith('paste', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('does not throw if called without init', () => {
    expect(cleanupClipboardListener).not.toThrow();
  });
});
