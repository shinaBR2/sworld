import { config } from '../config';
import { setItem } from 'core/universal/extension/storage';

console.log('Background script starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  if (sender.origin !== config.allowedOrigin) {
    return;
  }

  if (message.type === 'AUTH_TOKEN') {
    await setItem('auth0Token', message.token);
    sendResponse({ success: true });
  }
});
