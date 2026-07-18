import type { ExtensionMessage } from 'core/universal/extension/communication/types';
import { detectPageType } from './parsers/detector';
import { isPdfPage, parsePdfDocument } from './parsers/pdf';
import { extractTelegramMetadata } from './parsers/telegram';
import { extractVimeoMetadata } from './parsers/vimeo';
import { extractYouTubeMetadata } from './parsers/youtube';

const main = async () => {
  const url = window.location.href;
  const contentType = document.contentType;

  if (isPdfPage(url, contentType)) {
    try {
      const metadata = await parsePdfDocument(url);

      const message: ExtensionMessage = {
        source: 'content-script',
        target: 'background',
        type: 'PDF_METADATA_EXTRACTED',
        payload: metadata,
      };

      chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error('Failed to parse PDF metadata:', error);
    }
    return;
  }

  const pageType = detectPageType(url);

  if (pageType === 'youtube') {
    const metadata = extractYouTubeMetadata();
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'VIDEO_METADATA_EXTRACTED',
      payload: metadata,
    };
    chrome.runtime.sendMessage(message);
    return;
  }

  if (pageType === 'vimeo') {
    const metadata = extractVimeoMetadata();
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'VIDEO_METADATA_EXTRACTED',
      payload: metadata,
    };
    chrome.runtime.sendMessage(message);
    return;
  }

  if (pageType === 'telegram') {
    const metadata = extractTelegramMetadata();
    if (!metadata.channelId) return;
    const message: ExtensionMessage = {
      source: 'content-script',
      target: 'background',
      type: 'TELEGRAM_CHANNEL_DETECTED',
      payload: metadata,
    };
    chrome.runtime.sendMessage(message);
    return;
  }
};

main();
