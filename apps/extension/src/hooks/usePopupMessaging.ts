import type {
  ExtensionMessage,
  ImportStatus,
  PageContent,
} from 'core/universal/extension/communication/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useImportHistory } from './useImportHistory';

interface PopupMessagingState {
  content: PageContent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  imports: ImportStatus[];
  sendMessage: (message: ExtensionMessage) => void;
}

const CHROME_UNAVAILABLE = typeof chrome === 'undefined' || !chrome.runtime?.id;

const usePopupMessaging = (
  onStatusChange?: (status: ImportStatus) => void,
): PopupMessagingState => {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { imports, saveImports } = useImportHistory();
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const sendMessage = useCallback((message: ExtensionMessage) => {
    if (CHROME_UNAVAILABLE) return;
    chrome.runtime.sendMessage(message);
  }, []);

  useEffect(() => {
    if (CHROME_UNAVAILABLE) {
      setIsLoading(false);
      return;
    }

    const handleMessage = (message: ExtensionMessage) => {
      if (message.source !== 'background' || message.target !== 'popup') return;

      switch (message.type) {
        case 'CURRENT_TAB_CONTENT':
          setContent(message.payload);
          setIsLoading(false);
          break;
        case 'AUTH_STATE_CHANGED':
          setIsAuthenticated(message.payload.authenticated);
          break;
        case 'IMPORT_STATUS':
          saveImports((prev) => {
            const existing = prev.findIndex(
              (i) => i.importId === message.payload.importId,
            );
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = message.payload;
              return updated;
            }
            return [...prev, message.payload];
          });
          onStatusChangeRef.current?.(message.payload);
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    chrome.runtime.sendMessage(
      { type: 'GET_AUTH_STATUS' },
      (response: { authenticated: boolean } | undefined) => {
        if (response) {
          setIsAuthenticated(response.authenticated);
        }
      },
    );

    const requestMessage: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'REQUEST_TAB_CONTENT',
    };
    chrome.runtime.sendMessage(requestMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [saveImports]);

  return { content, isLoading, isAuthenticated, imports, sendMessage };
};

export { usePopupMessaging };
