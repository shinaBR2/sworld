import type {
  PageContent,
  PdfMetadata,
  VideoMetadata,
} from 'core/universal/extension/communication/types';
import { removeItems, setItem } from 'core/universal/extension/storage';
import { config } from '../config';
import { getToken, isAuthenticated, logout } from './background/auth';
import { createImportRecord, updateImportStatus } from './background/imports';
import { importBook } from './background/library';
import { importVideo } from './background/watch';

console.log('Background script starting...');

let currentPageContent: PageContent | null = null;
let currentPdfMetadata: PdfMetadata | null = null;
let storedVideoMetadata: VideoMetadata | null = null;

const importBookAsync = async (metadata: PdfMetadata): Promise<void> => {
  const record = createImportRecord('library', metadata.title);

  updateImportStatus(record.importId, 'importing');

  const result = await importBook(metadata);

  if (result.success) {
    updateImportStatus(record.importId, 'completed');
  } else {
    updateImportStatus(record.importId, 'failed', result.error);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

// Content scripts don't run inside Chrome's PDF viewer, so detect PDF tabs
// here and feed the popup the same PageContent shape.
const PDF_URL_RE = /\.pdf$/i;

const detectPdfTab = (url: string) => {
  const fileName = url.split('/').pop() || url;
  const title = decodeURIComponent(fileName.replace(/\.pdf$/i, '')) || fileName;

  currentPdfMetadata = {
    url,
    title,
    author: null,
    pageCount: 0,
    fileUrl: url,
    fileName,
    fileSizeBytes: null,
  };

  currentPageContent = {
    pageType: 'pdf',
    url,
    title,
  };

  chrome.runtime.sendMessage({
    source: 'background',
    target: 'popup',
    type: 'CURRENT_TAB_CONTENT',
    payload: currentPageContent,
  });
};

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && PDF_URL_RE.test(tab.url)) {
    detectPdfTab(tab.url);
  }
});

chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    if (sender.origin !== config.allowedOrigin) {
      return;
    }

    const { type, data } = message;

    if (type === 'AUTH_TOKEN') {
      await setItem('auth0Token', data);
      sendResponse({ success: true });
      return;
    }

    if (type === 'LOGOUT') {
      await removeItems(['auth0Token']);
      sendResponse({ success: true });
      return;
    }
  },
);

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  const { type, data } = message;

  switch (type) {
    case 'GET_AUTH_STATUS': {
      const authenticated = await isAuthenticated();
      sendResponse({ authenticated });
      return;
    }

    case 'GET_TOKEN': {
      const token = await getToken();
      sendResponse({ token });
      return;
    }

    case 'LOGOUT': {
      await logout();
      sendResponse({ success: true });
      return;
    }

    case 'PDF_METADATA_EXTRACTED': {
      currentPdfMetadata = message.payload as PdfMetadata;
      currentPageContent = {
        url: currentPdfMetadata.url,
        title: currentPdfMetadata.title || 'Untitled PDF',
        pageType: 'pdf',
        description: currentPdfMetadata.author
          ? `Author: ${currentPdfMetadata.author}`
          : undefined,
      };
      sendResponse({ received: true });
      return;
    }

    case 'VIDEO_METADATA_EXTRACTED': {
      storedVideoMetadata = data;
      sendResponse({ success: true });
      return;
    }

    case 'REQUEST_TAB_CONTENT': {
      chrome.runtime.sendMessage({
        source: 'background',
        target: 'popup',
        type: 'CURRENT_TAB_CONTENT',
        payload: currentPageContent ?? storedVideoMetadata ?? null,
      });
      return;
    }

    case 'IMPORT_CONTENT': {
      const { targetApp } = message.payload as {
        contentId: string;
        targetApp: 'library' | 'watch';
      };

      if (targetApp === 'library') {
        if (!currentPdfMetadata) {
          sendResponse({ started: false, error: 'No PDF metadata available' });
          return;
        }
        importBookAsync(currentPdfMetadata);
        sendResponse({ started: true });
        return;
      }

      if (targetApp === 'watch') {
        if (!storedVideoMetadata) {
          sendResponse({
            success: false,
            error: 'No video metadata available',
          });
          return;
        }

        const record = createImportRecord('watch', storedVideoMetadata.title);
        updateImportStatus(record.importId, 'importing');

        try {
          const result = await importVideo(storedVideoMetadata);

          if (result.success) {
            updateImportStatus(record.importId, 'completed');
            sendResponse({ success: true, videoId: result.videoId });
          } else {
            updateImportStatus(record.importId, 'failed', result.error);
            sendResponse({ success: false, error: result.error });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          updateImportStatus(record.importId, 'failed', message);
          sendResponse({ success: false, error: message });
        }
        return;
      }

      sendResponse({ started: false, error: 'Unsupported target app' });
      return;
    }
  }
});
