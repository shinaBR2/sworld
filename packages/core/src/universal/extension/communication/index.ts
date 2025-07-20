interface NotifyExtensionParams<T> {
  id: string;
  type: string;
  data?: T;
}

/**
 * Sends a message to a Chrome extension
 * @param params The message parameters
 * @param params.id The extension ID to send the message to
 * @param params.type The type of the message
 * @param params.data The data to send with the message
 */
const notifyExtension = <T>({ id, type, data }: NotifyExtensionParams<T>) => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage(id, { type, data }, () => {
      // Ignore errors - extension might not be installed
      if (chrome.runtime.lastError) {
        console.log('Extension not available');
      }
    });
  }
};

export { notifyExtension };
