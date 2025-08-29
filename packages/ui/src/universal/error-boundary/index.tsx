import { ErrorOutline } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { texts } from './texts';

interface ErrorFallbackProps {
  errorMessage?: string;
  canRetry?: boolean;
}

const ErrorFallback = (props: ErrorFallbackProps) => {
  const { errorMessage = texts.message, canRetry = true } = props;

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
          <CardContent sx={{ textAlign: 'center' }}>
            <ErrorOutline
              color="error"
              sx={{
                fontSize: 80,
                mb: 2,
              }}
            />
            <Box textAlign="center" py={2}>
              <Typography variant="h5" component="h2" gutterBottom>
                {texts.title}
              </Typography>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {errorMessage}
              </Typography>
              {canRetry && (
                <Box mt={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => window.location.reload()}
                  >
                    {texts.tryAgain}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export { ErrorFallback };
