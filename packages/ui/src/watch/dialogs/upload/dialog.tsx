import React from 'react';
import { Alert, Box, Button, DialogContent, DialogTitle, Fade, TextField, TextFieldVariants } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton } from './styled';
import { SubmitButton } from './submit-button';
import { DialogState } from './types';

interface UploadErrorResultProps {
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  errorMessage: string;
}

const UploadErrorResult = (props: UploadErrorResultProps) => {
  const { isSubmitting, handleSubmit, errorMessage } = props;

  return (
    <Fade in>
      <Alert
        severity="error"
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={handleSubmit} disabled={isSubmitting}>
            Retry
          </Button>
        }
      >
        {errorMessage}
      </Alert>
    </Fade>
  );
};

interface FormProps {
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
  isSubmitting: boolean;
  formProps: FormProps;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Raw UI component for storybook
 * @param props
 * @returns
 */
const DialogComponent = (props: DialogComponentProps) => {
  const { state, open, handleClose, isSubmitting, formProps, handleSubmit } = props;
  const { onTitleChange, onUrlChange, onDescriptionChange } = formProps;

  const onClose = () => {
    if (isSubmitting) {
      return;
    }

    handleClose();
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
    isSubmitting,
    onClick: handleSubmit,
  };
  const uploadErrorResultProps = {
    handleSubmit,
    isSubmitting,
    errorMessage: state.error as string,
  };
  const uploadSuccessResultProps = {
    message: `Successfully uploaded. Dialog will close in ${state.closeDialogCountdown} seconds.`,
  };

  return (
    <StyledDialog {...dialogProps}>
      <DialogTitle id="video-upload-dialog-title">
        {texts.dialog.title}
        <StyledCloseButton onClick={onClose} aria-label={texts.dialog.closeButton} disabled={isSubmitting}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" noValidate aria-label="Video URL validation form" sx={{ mt: 2 }}>
          <TextField value={state.title} onChange={onTitleChange} {...titleTextFieldProps} />
          <TextField value={state.url} onChange={onUrlChange} {...urlTextFieldProps} />
          <TextField value={state.description} onChange={onDescriptionChange} {...descriptionTextFieldProps} />

          {state.error && <UploadErrorResult {...uploadErrorResultProps} />}
          {state.error === '' && <UploadSuccessResult {...uploadSuccessResultProps} />}

          <SubmitButton {...submitButtonProps} />
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export { DialogComponent };
