chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!sender.origin?.includes('localhost') && sender.origin !== 'https://your-web-app.com') {
    return;
  }

  if (message.type === 'AUTH_TOKEN') {
    chrome.storage.local.set({ auth0Token: message.token });
    sendResponse({ success: true });
  }
});
