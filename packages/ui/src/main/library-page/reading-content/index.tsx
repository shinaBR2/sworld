import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';

interface ReadingContentProps {
  isLoading: boolean;
  error?: string | null;
  pdfUrl: string;
  onErrorClick: () => void;
}

const ReadingContent = (props: ReadingContentProps) => {
  const { isLoading, error, pdfUrl, onErrorClick } = props;

  return (
    <Box
      id="pdf-container"
      sx={{
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            minHeight: 0,
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading PDF...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Box sx={{ width: '100%', maxWidth: 600, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={onErrorClick} fullWidth>
            Reload
          </Button>
        </Box>
      )}

      {/* PDF Document */}
      {!error && !isLoading && pdfUrl && (
        <Box
          sx={{
            width: '100%',
            height: 'calc(100vh - 70px)',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{
              border: 'none',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export { ReadingContent };
