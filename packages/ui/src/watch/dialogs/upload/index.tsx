import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton, StyledResultsStack } from './styled';
import DialogContent from '@mui/material/DialogContent';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (urls: string[]) => Promise<void>;
}

interface ValidationResult {
  url: string;
  isValid: boolean;
}

export const VideoUploadDialog: React.FC<VideoUploadDialogProps> = props => {
  const { open, onOpenChange, onSubmit } = props;
  const [urls, setUrls] = useState('');
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const handleClose = () => onOpenChange(false);

  const validateUrls = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);

    // TODO
    // Handle case auto transform cases from services like Cloudinary
    const urlList = urls
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);
    const validationResults = await Promise.all(
      urlList.map(async url => ({
        url: url.trim(),
        isValid: ReactPlayer.canPlay(url.trim()),
      }))
    );

    setResults(validationResults);
    setValidating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setSubmitting(true);
    try {
      const validUrls = results
        .filter(result => result.isValid)
        .map(result => result.url);

      await onSubmit(validUrls);
      handleClose();
    } catch (error) {
      console.error('Error submitting videos:', error);
      // You might want to show an error message to the user here
    } finally {
      setSubmitting(false);
    }
  };

  const allResultsValid =
    results.length > 0 && results.every(result => result.isValid);
  const showSubmitButton = allResultsValid && onSubmit;
  const isBusy = validating || submitting;

  useEffect(() => {
    if (!urls.trim()) {
      setResults([]);
    }
  }, [urls]);

  return (
    <StyledDialog
      open={open}
      onClose={isBusy ? undefined : handleClose}
      aria-labelledby="video-upload-dialog-title"
      disableEscapeKeyDown
    >
      <DialogTitle id="video-upload-dialog-title">
        {texts.dialog.title}
        <StyledCloseButton
          onClick={handleClose}
          aria-label={texts.dialog.closeButton}
        >
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={validateUrls}
          noValidate
          aria-label="Video URL validation form"
          sx={{ mt: 2 }}
        >
          <TextField
            fullWidth
            multiline
            rows={4}
            value={urls}
            onChange={e => setUrls(e.target.value)}
            placeholder={texts.form.urlInput.placeholder}
            label={texts.form.urlInput.label}
            helperText={texts.form.urlInput.helperText}
            variant="outlined"
            sx={{ mb: 2 }}
            aria-label={texts.form.urlInput.label}
            inputProps={{ 'data-testid': 'url-input-textarea' }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isBusy || !urls.trim()}
            sx={{ mb: 2 }}
            aria-busy={isBusy}
            onClick={showSubmitButton ? handleSubmit : validateUrls}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                {texts.form.submitButton.submitting}
              </Box>
            ) : validating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                {texts.form.submitButton.validating}
              </Box>
            ) : showSubmitButton ? (
              texts.form.submitButton.submit
            ) : (
              texts.form.submitButton.default
            )}
          </Button>

          {results.length > 0 && (
            <StyledResultsStack
              spacing={1}
              role="list"
              aria-label="Validation results"
            >
              {results.map((result, index) => (
                <Alert
                  key={index}
                  severity={result.isValid ? 'success' : 'error'}
                  role="listitem"
                  aria-label={
                    result.isValid
                      ? texts.validation.valid.ariaLabel
                      : texts.validation.invalid.ariaLabel
                  }
                >
                  <Box sx={{ wordBreak: 'break-all' }}>{result.url}</Box>
                  <Box sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    {result.isValid
                      ? texts.validation.valid.status
                      : texts.validation.invalid.status}
                  </Box>
                </Alert>
              ))}
            </StyledResultsStack>
          )}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default VideoUploadDialog;
