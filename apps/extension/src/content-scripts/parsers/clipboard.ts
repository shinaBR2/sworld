import type {
  ClipboardContent,
  ExtensionMessage,
} from 'core/universal/extension/communication/types';

const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

const extractUrls = (text: string): string[] => {
  return text.match(URL_REGEX) ?? [];
};

const detectContentType = (
  text: string,
  urls: string[],
): 'url' | 'text' | 'isbn' | 'unknown' => {
  const trimmed = text.trim();

  if (urls.length === 1 && urls[0] === trimmed) {
    return 'url';
  }

  if (urls.length === 0) {
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length === 13 && /^97[89]/.test(digitsOnly)) {
      return 'isbn';
    }
    return 'text';
  }

  return 'unknown';
};

let handlePaste: ((event: Event) => void) | null = null;

const initClipboardListener = (): void => {
  if (typeof document === 'undefined') return;

  handlePaste = (event: Event) => {
    const pasteEvent = event as ClipboardEvent;
    const pastedText = pasteEvent.clipboardData?.getData('text');
    if (!pastedText) return;

    const urls = extractUrls(pastedText);
    const detectedType = detectContentType(pastedText, urls);

    const content: ClipboardContent = {
      text: pastedText,
      detectedType,
      ...(urls.length > 0 && { url: urls[0] }),
    };

    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'USER_CLIPBOARD_ACTION',
      payload: content,
    };

    chrome.runtime.sendMessage(message);
  };

  document.addEventListener('paste', handlePaste);
};

const cleanupClipboardListener = (): void => {
  if (handlePaste) {
    document.removeEventListener('paste', handlePaste);
    handlePaste = null;
  }
};

export {
  extractUrls,
  detectContentType,
  initClipboardListener,
  cleanupClipboardListener,
};
