console.log('Background script starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log(`Received message from ${sender.origin}`);
  if (!sender.origin?.includes('localhost') && sender.origin !== 'https://shinabr2.com') {
    return;
  }

  console.log(`Message type: ${message.type} and token: ${message.token}`);

  if (message.type === 'AUTH_TOKEN') {
    chrome.storage.local.set({ auth0Token: message.token });
    sendResponse({ success: true });
  }
});
