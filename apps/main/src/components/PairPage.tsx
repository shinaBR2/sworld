import { TypedDocumentString } from 'core/graphql/graphql';
import { useAuthContext } from 'core/providers/auth';
import { useMutationRequest } from 'core/universal/hooks/useMutation';
import type React from 'react';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from 'ui/universal/containers/generic';

interface AuthorizeDeviceResponse {
  authorizeDevice: {
    success: boolean;
    data?: {
      success: boolean;
    } | null;
    error?: {
      code: string;
      message: string;
    } | null;
  };
}

interface AuthorizeDeviceVariables {
  input: {
    userCode: string;
  };
}

const authorizeDeviceMutation = new TypedDocumentString<
  AuthorizeDeviceResponse,
  AuthorizeDeviceVariables
>(`
  mutation AuthorizeDevice($input: AuthorizeDeviceInput!) {
    authorizeDevice(input: $input) {
      success
      data {
        success
      }
      error {
        code
        message
      }
    }
  }
`);

type PageState = 'input' | 'loading' | 'success' | 'error';

const PairPage: React.FC = () => {
  const { getAccessToken } = useAuthContext();
  const [userCode, setUserCode] = useState('');
  const [pageState, setPageState] = useState<PageState>('input');

  const { mutateAsync: authorizeDevice } = useMutationRequest({
    document: authorizeDeviceMutation,
    getAccessToken,
  });

  const handleAuthorize = async () => {
    if (!userCode.trim()) return;

    setPageState('loading');

    try {
      const result = await authorizeDevice({
        input: { userCode: userCode.trim() },
      });

      if (result.authorizeDevice.success) {
        setPageState('success');
      } else {
        setPageState('error');
      }
    } catch {
      setPageState('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserCode(e.target.value);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        {pageState === 'success' ? (
          <Alert severity="success" sx={{ width: '100%' }}>
            Extension paired! You can close this page.
          </Alert>
        ) : pageState === 'error' ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
            }}
          >
            <Alert severity="error">
              Invalid code. Please check and try again.
            </Alert>
            <Button
              variant="outlined"
              onClick={() => setPageState('input')}
              fullWidth
            >
              Try again
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" component="h1" gutterBottom>
              Pair Extension
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Enter the code shown in your browser extension to authorize it.
            </Typography>
            <TextField
              fullWidth
              label="User code"
              placeholder="e.g. BIRD-123"
              value={userCode}
              onChange={handleChange}
              disabled={pageState === 'loading'}
              autoFocus
            />
            <Button
              variant="contained"
              onClick={handleAuthorize}
              disabled={!userCode.trim() || pageState === 'loading'}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {pageState === 'loading' ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Authorize'
              )}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export { PairPage };
