import { removeItems, setItem } from 'core/universal/extension/storage';
import { config } from '../config';
import {
  getToken,
  isAuthenticated,
  logout,
  pollForDeviceToken,
  startPairing,
} from './background/auth';

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

    case 'START_PAIRING': {
      try {
        const result = await startPairing();
        sendResponse({ success: true, ...result });
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return;
    }

    case 'POLL_FOR_TOKEN': {
      const { deviceCode, interval, expiresIn } = data;
      try {
        await pollForDeviceToken(deviceCode, interval, expiresIn);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return;
    }

    case 'LOGOUT': {
      await logout();
      sendResponse({ success: true });
      return;
    }
  }
});
