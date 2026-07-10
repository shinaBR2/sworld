import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const AuthPanel = () => {
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const startPairing = useCallback(() => {
    setIsLoading(true);
    setError('');

    chrome.runtime.sendMessage(
      { type: 'START_PAIRING' },
      (
        response:
          | {
              success: boolean;
              userCode: string;
              verificationUri: string;
              deviceCode: string;
              interval: number;
              expiresIn: number;
              error?: string;
            }
          | undefined,
      ) => {
        if (!response || !response.success) {
          setError(response?.error || 'Failed to start pairing');
          setIsLoading(false);
          return;
        }

        setUserCode(response.userCode);
        setVerificationUri(response.verificationUri);
        setIsLoading(false);

        chrome.runtime.sendMessage(
          {
            type: 'POLL_FOR_TOKEN',
            data: {
              deviceCode: response.deviceCode,
              interval: response.interval,
              expiresIn: response.expiresIn,
            },
          },
          (pollResponse: { success: boolean; error?: string } | undefined) => {
            if (!pollResponse || !pollResponse.success) {
              setError(pollResponse?.error || 'Pairing failed');
            }
          },
        );
      },
    );
  }, []);

  useEffect(() => {
    startPairing();
  }, [startPairing]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={startPairing} fullWidth>
          Retry Pairing
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Connect Your Account
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Visit the verification URL and enter the code below to connect your
        account:
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="grey.900"
        borderRadius={1}
        p={2}
        my={2}
      >
        <Typography
          variant="h4"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing={4}
        >
          {userCode}
        </Typography>
      </Box>
      <Button
        variant="contained"
        fullWidth
        onClick={handleCopyCode}
        sx={{ mb: 1 }}
      >
        {copied ? 'Copied!' : 'Copy Code'}
      </Button>
      <Button
        variant="outlined"
        fullWidth
        onClick={() => window.open(verificationUri, '_blank')}
      >
        Open Verification Page
      </Button>
    </Box>
  );
};

export { AuthPanel };
