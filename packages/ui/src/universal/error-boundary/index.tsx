import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { ReactNode } from 'react';

const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Container maxWidth="sm">
        <Card elevation={12}>
          <CardContent>
            <Box textAlign="center" py={2}>
              <Typography variant="h5" component="h2" gutterBottom>
                Something went wrong
              </Typography>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {'An unexpected error occurred'}
              </Typography>
              <Box mt={3}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={resetErrorBoundary}
                >
                  Try again
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {props.children}
    </ReactErrorBoundary>
  );
};

export { ErrorFallback, ErrorBoundary };
