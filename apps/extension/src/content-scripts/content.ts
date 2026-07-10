import type { ExtensionMessage } from 'core/universal/extension/communication/types';

import { isPdfPage, parsePdfDocument } from './parsers/pdf';

const main = async () => {
  const url = window.location.href;
  const contentType = document.contentType;

  if (!isPdfPage(url, contentType)) {
    return;
  }

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
};

main();
