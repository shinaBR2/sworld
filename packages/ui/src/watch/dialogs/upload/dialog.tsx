import React from 'react';
import { Alert, Box, Button, DialogContent, DialogTitle, Fade, TextField, TextFieldVariants } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton } from './styled';
import { SubmitButton } from './submit-button';
import { ValidationResults } from './validation-results';
import { DialogState } from './types';

interface UploadErrorResultProps {
  isBusy: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  errorMessage: string;
}

const UploadErrorResult = (props: UploadErrorResultProps) => {
  const { isBusy, handleSubmit, errorMessage } = props;

  return (
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
        {errorMessage}
      </Alert>
    </Fade>
  );
};

interface UploadSuccessResultProps {
  message: string;
}

const UploadSuccessResult = (props: UploadSuccessResultProps) => {
  const { message } = props;

  return (
    <Fade in>
      <Alert severity="success" sx={{ mb: 2 }}>
        {message}
      </Alert>
    </Fade>
  );
};

interface DialogComponentProps {
  state: DialogState;
  open: boolean;
  handleClose: () => void;
  isBusy: boolean;
  isSubmitting: boolean;
  validateUrls: (e: React.FormEvent) => Promise<void>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  showSubmitButton: boolean;
}

/**
 * Raw UI component for storybook
 * @param props
 * @returns
 */
const DialogComponent = (props: DialogComponentProps) => {
  const {
    state,
    open,
    handleClose,
    isBusy,
    isSubmitting,
    validateUrls,
    onTitleChange,
    onUrlsChange,
    onDescriptionChange,
    handleSubmit,
    showSubmitButton,
  } = props;

  const onClose = () => {
    if (isBusy) {
      return;
    }

    handleClose();
  };
  const onSubmit = (e: React.FormEvent) => {
    if (showSubmitButton) {
      handleSubmit(e);
      return;
    }

    validateUrls(e);
  };

  const dialogProps = {
    open,
    onClose,
    'aria-labelledby': 'video-upload-dialog-title',
    disableEscapeKeyDown: true,
    'data-testid': 'upload-video-dialog',
  };
  const titleTextFieldProps = {
    fullWidth: true,
    placeholder: texts.form.titleInput.placeholder,
    label: texts.form.titleInput.label,
    helperText: texts.form.titleInput.helperText,
    variant: 'outlined' as TextFieldVariants,
    sx: { mb: 2 },
    'aria-label': texts.form.titleInput.label,
    inputProps: { 'data-testid': 'title-input-text' },
    required: true,
    disabled: isSubmitting,
  };
  const urlTextFieldProps = {
    fullWidth: true,
    placeholder: texts.form.urlInput.placeholder,
    label: texts.form.urlInput.label,
    helperText: texts.form.urlInput.helperText,
    variant: 'outlined' as TextFieldVariants,
    sx: { mb: 2 },
    'aria-label': texts.form.urlInput.label,
    inputProps: { 'data-testid': 'url-input-textarea' },
    required: true,
    disabled: isSubmitting,
  };
  const descriptionTextFieldProps = {
    fullWidth: true,
    multiline: true,
    rows: 4,
    placeholder: texts.form.descriptionInput.placeholder,
    label: texts.form.descriptionInput.label,
    helperText: texts.form.descriptionInput.helperText,
    variant: 'outlined' as TextFieldVariants,
    sx: { mb: 2 },
    'aria-label': texts.form.descriptionInput.label,
    inputProps: { 'data-testid': 'description-input-textarea' },
    disabled: isSubmitting,
  };
  const submitButtonProps = {
    isBusy: isBusy,
    isSubmitting: isSubmitting,
    validating: state.validating,
    showSubmitButton: showSubmitButton,
    urls: state.urls,
    onClick: onSubmit,
  };
  const uploadErrorResultProps = {
    handleSubmit: handleSubmit,
    isBusy: isBusy,
    errorMessage: state.error as string,
  };
  const uploadSuccessResultProps = {
    message: `Successfully uploaded ${state.success?.insert_videos?.returning?.length} video(s). Dialog will close in ${state.closeDialogCountdown} seconds.`,
  };

  return (
    <StyledDialog {...dialogProps}>
      <DialogTitle id="video-upload-dialog-title">
        {texts.dialog.title}
        <StyledCloseButton onClick={onClose} aria-label={texts.dialog.closeButton} disabled={isBusy}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={validateUrls} noValidate aria-label="Video URL validation form" sx={{ mt: 2 }}>
          <TextField value={state.title} onChange={onTitleChange} {...titleTextFieldProps} />
          <TextField value={state.urls} onChange={onUrlsChange} {...urlTextFieldProps} />
          <TextField value={state.description} onChange={onDescriptionChange} {...descriptionTextFieldProps} />

          {state.error && <UploadErrorResult {...uploadErrorResultProps} />}
          {state.success && <UploadSuccessResult {...uploadSuccessResultProps} />}

          <SubmitButton {...submitButtonProps} />

          {state.results.length > 0 && !isSubmitting && <ValidationResults results={state.results} />}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export { DialogComponent };
