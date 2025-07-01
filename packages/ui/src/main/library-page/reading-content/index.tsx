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
        // pt: '80px',
        // pb: '80px',
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
      {/* {!error && pdfUrl && (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={null}
          options={
            {
              // Add CORS headers for GCP Cloud Storage
              // httpHeaders: {
              //   'Access-Control-Allow-Origin': '*',
              // },
              // Enable text selection
              // enableTextSelection: true,
            }
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            width={pageWidth}
            onLoadSuccess={onPageLoadSuccess}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <Box
                sx={{
                  width: pageWidth,
                  height: pageWidth * 1.414, // A4 aspect ratio
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CircularProgress />
              </Box>
            }
            error={
              <Box
                sx={{
                  width: pageWidth,
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography color="error">Failed to load page</Typography>
              </Box>
            }
          />
        </Document>
      )} */}
    </Box>
  );
};

export { ReadingContent };
