import { config } from '../config';

console.log('Background script starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (sender.origin !== config.allowedOrigin) {
    return;
  }

  if (message.type === 'AUTH_TOKEN') {
    chrome.storage.local.set({ auth0Token: message.token });
    sendResponse({ success: true });
  }
});
