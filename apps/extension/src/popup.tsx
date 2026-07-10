import { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { AuthPanel } from './components/AuthPanel';
import { AutoDetectTab } from './components/AutoDetectTab';
import { ClipboardTab } from './components/ClipboardTab';
import { RecentTab } from './components/RecentTab';
import { usePopupMessaging } from './hooks/usePopupMessaging';
import type { ExtensionMessage } from 'core/universal/extension/communication/types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Popup = () => {
  const { content, isLoading, isAuthenticated, imports, sendMessage } =
    usePopupMessaging();
  const [tabIndex, setTabIndex] = useState(0);

  const handleImport = (contentId: string, targetApp: 'library' | 'watch') => {
    const message: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'IMPORT_CONTENT',
      payload: { contentId, targetApp },
    };
    sendMessage(message);
  };

  const handleRetry = (importId: string) => {
    const message: ExtensionMessage = {
      source: 'popup',
      target: 'background',
      type: 'RETRY_IMPORT',
      payload: { importId },
    };
    sendMessage(message);
  };

  const handleImportClipboard = (text: string) => {
    handleImport(text, 'library');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box width={400} minHeight={400}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} p={2}>
            <Typography variant="h6" fontWeight="bold">
              SWorld
            </Typography>
          </Box>
          <AuthPanel />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        width={400}
        minHeight={400}
        maxHeight={600}
        display="flex"
        flexDirection="column"
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} p={2}>
          <Typography variant="h6" fontWeight="bold">
            SWorld
          </Typography>
        </Box>
        <Tabs
          value={tabIndex}
          onChange={(_, newIndex) => setTabIndex(newIndex)}
          variant="fullWidth"
        >
          <Tab label="Auto-Detect" />
          <Tab label="Clipboard" />
          <Tab label="Recent" />
        </Tabs>
        <Box flex={1} overflow="auto">
          {tabIndex === 0 && (
            <AutoDetectTab
              content={content}
              isLoading={isLoading}
              onImport={handleImport}
            />
          )}
          {tabIndex === 1 && (
            <ClipboardTab onImportClipboard={handleImportClipboard} />
          )}
          {tabIndex === 2 && (
            <RecentTab imports={imports} onRetry={handleRetry} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export { Popup };
