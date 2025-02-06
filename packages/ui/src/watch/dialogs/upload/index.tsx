import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, DialogContent, DialogTitle, Fade, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Auth, watchMutationHooks } from 'core';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton } from './styled';
import { SubmitButton } from './submit-button';
import { ValidationResult, ValidationResults } from './validation-results';
import { canPlayUrls } from './utils';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DialogState {
  urls: string;
  validating: boolean;
  results: ValidationResult[];
  error: string | null;
  success: watchMutationHooks.BulkConvertResponse | null;
  closeDialogCountdown: number;
}

const CLOSE_DELAY_MS = 3000;

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

// const mockSuccessSubmit = async (urls: string[]) => {
//   await new Promise(resolve => setTimeout(resolve, 2500));
//   return {
//     insert_videos: {
//       returning: urls.map((_, index) => ({
//         id: `test-${index}`,
//         title: 'adas',
//         description: 'adsad',
//       })),
//     },
//   };
// };

// const mockFailedSubmit = async () => {
//   await new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Failed to upload videos')), 2500));
// };

/**
 * Stateful component holding state and hooks
 * @param param0
 * @returns
 */
const VideoUploadDialog = ({ open, onOpenChange }: VideoUploadDialogProps) => {
  const [state, setState] = useState<DialogState>({
    urls: '',
    validating: false,
    results: [],
    error: null,
    success: null,
    closeDialogCountdown: CLOSE_DELAY_MS / 1000,
  });

  const { user, getAccessToken } = Auth.useAuthContext();
  // const { user } = Auth.useAuthContext();
  const { mutateAsync: bulkConvert, isPending: isSubmitting } = watchMutationHooks.useBulkConvertVideos({
    getAccessToken,
  });

  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const bulkConvert = async (_data: { objects: any[] }) => {
  //   setIsSubmitting(true);
  //   try {
  //     // Use mockSuccessSubmit for testing success case
  //     // Or mockFailedSubmit for testing error case
  //     // const response = await mockFailedSubmit(sdata.objects.map(obj => obj.video_url));
  //     const response = await mockFailedSubmit();
  //     setIsSubmitting(false);
  //     return response;
  //   } catch (error) {
  //     setIsSubmitting(false);
  //     throw error;
  //   }
  // };

  const handleClose = () => {
    setState({
      urls: '',
      validating: false,
      results: [],
      error: null,
      success: null,
      closeDialogCountdown: CLOSE_DELAY_MS / 1000,
    });
    onOpenChange(false);
  };

  const validateUrls = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, validating: true, error: null }));

    const urlList = state.urls
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);
    const validationResults = await canPlayUrls(urlList);

    setState(prev => ({ ...prev, results: validationResults, validating: false }));
  };

  const onUrlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({
      ...prev,
      urls: newValue,
      // Only clear results and error if there's no success message
      ...(!newValue.trim() && !prev.success
        ? {
            results: [],
            error: null,
          }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, error: null, success: null }));

    try {
      const validUrls = state.results.filter(result => result.isValid).map(result => result.url);
      const timestamp = Date.now();

      // TODO
      // This is temporary
      // consider this later
      const response = await bulkConvert({
        objects: validUrls.map((url, index) => ({
          title: `untitled-${timestamp}`,
          description: `description-${timestamp} for url ${url}`,
          slug: `untitled-${user?.id}-${index}-${timestamp}`,
          video_url: url,
        })),
      });

      setState(prev => ({
        ...prev,
        success: response,
        urls: '', // Reset input on success
        results: [], // Reset results
        closeDialogCountdown: CLOSE_DELAY_MS / 1000,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while uploading videos.';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const allResultsValid = state.results.length > 0 && state.results.every(result => result.isValid);
  const showSubmitButton = allResultsValid;
  const isBusy = state.validating || isSubmitting;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (state.success) {
      timer = setInterval(() => {
        setState(prev => {
          if (prev.closeDialogCountdown <= 1) {
            clearInterval(timer);
            handleClose();
            return {
              ...prev,
              closeDialogCountdown: 0,
            };
          }

          return {
            ...prev,
            closeDialogCountdown: prev.closeDialogCountdown - 1,
          };
        });
      }, 1000);

      // Clear the timer when dialog closes
      setTimeout(() => {
        clearInterval(timer);
        setState(prev => ({
          ...prev,
          closeDialogCountdown: CLOSE_DELAY_MS / 1000,
        }));
      }, CLOSE_DELAY_MS);
    }

    return () => {
      clearInterval(timer);
    };
  }, [state.success]);

  return (
    <DialogComponent
      open={open}
      state={state}
      handleClose={handleClose}
      validateUrls={validateUrls}
      onUrlsChange={onUrlsChange}
      handleSubmit={handleSubmit}
      isBusy={isBusy}
      isSubmitting={isSubmitting}
      showSubmitButton={showSubmitButton}
    />
  );
};

export { DialogComponent, VideoUploadDialog };
