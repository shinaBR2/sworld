import { removeItems, setItem } from 'core/universal/extension/storage';
import { config } from '../config';

console.log('Background script starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
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
