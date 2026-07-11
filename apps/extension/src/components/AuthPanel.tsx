import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const AuthPanel = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const checkStatus = useCallback(() => {
    chrome.runtime.sendMessage(
      { type: 'GET_AUTH_STATUS' },
      (response: { authenticated: boolean } | undefined) => {
        setAuthenticated(response?.authenticated ?? false);
      },
    );
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (authenticated === null) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (authenticated) {
    return (
      <Box p={2}>
        <Alert severity="success">Extension connected to your account.</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Log in to shinabr2.com in this browser to connect your extension.
      </Alert>
      <Typography variant="body2" color="text.secondary">
        Once you&apos;re signed in, your account token is sent to the extension
        automatically.
      </Typography>
    </Box>
  );
};

export { AuthPanel };
