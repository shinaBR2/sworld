import React from 'react';
import { Alert, Box, Button, DialogContent, DialogTitle, Fade, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton } from './styled';
import { SubmitButton } from './submit-button';
import { ValidationResults } from './validation-results';
import { DialogState } from './types';

interface DialogComponentProps {
  state: DialogState;
  open: boolean;
  handleClose: () => void;
  isBusy: boolean;
  isSubmitting: boolean;
  validateUrls: (e: React.FormEvent) => Promise<void>;
  onUrlsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  showSubmitButton: boolean;
}

/**
 * Raw UI component for storybook
 * @param props
 * @returns
 */
const DialogComponent = (props: DialogComponentProps) => {
  const { state, open, handleClose, isBusy, isSubmitting, validateUrls, onUrlsChange, handleSubmit, showSubmitButton } =
    props;

  return (
    <StyledDialog
      open={open}
      onClose={isBusy ? undefined : handleClose}
      aria-labelledby="video-upload-dialog-title"
      disableEscapeKeyDown
      data-testid="upload-video-dialog"
    >
      <DialogTitle id="video-upload-dialog-title">
        {texts.dialog.title}
        <StyledCloseButton onClick={handleClose} aria-label={texts.dialog.closeButton} disabled={isBusy}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={validateUrls} noValidate aria-label="Video URL validation form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={state.urls}
            onChange={onUrlsChange}
            placeholder={texts.form.urlInput.placeholder}
            label={texts.form.urlInput.label}
            helperText={texts.form.urlInput.helperText}
            variant="outlined"
            sx={{ mb: 2 }}
            aria-label={texts.form.urlInput.label}
            inputProps={{ 'data-testid': 'url-input-textarea' }}
            disabled={isSubmitting}
          />

          {state.error && (
            <Fade in>
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleSubmit} disabled={isBusy}>
                    Retry
                  </Button>
                }
              >
                {state.error}
              </Alert>
            </Fade>
          )}

          {state.success && (
            <Fade in>
              <Alert severity="success" sx={{ mb: 2 }}>
                Successfully uploaded {state.success.insert_videos.returning.length} video(s). Dialog will close in{' '}
                {state.closeDialogCountdown} seconds.
              </Alert>
            </Fade>
          )}

          <SubmitButton
            isBusy={isBusy}
            isSubmitting={isSubmitting}
            validating={state.validating}
            showSubmitButton={showSubmitButton}
            urls={state.urls}
            onClick={showSubmitButton ? handleSubmit : validateUrls}
          />

          {state.results.length > 0 && !isSubmitting && <ValidationResults results={state.results} />}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export { DialogComponent };
