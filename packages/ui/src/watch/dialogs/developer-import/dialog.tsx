import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import { useIsMobile } from '../../../universal/responsive';
import { StyledCloseButton, StyledDialog } from '../styled';
import { getFormFieldStaticConfigs } from './fields';
import { texts } from './texts';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { SubmitButton } from '../components/submit-button';
import { DialogState } from './types';

interface DialogComponentProps {
  state: DialogState;
  open: boolean;
  handleClose: () => void;
  onFormFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const DialogComponent = (props: DialogComponentProps) => {
  const { state, open, handleClose, onFormFieldChange, handleSubmit } = props;
  const { isSubmitting, url, error, closeDialogCountdown } = state;
  const isMobile = useIsMobile();

  const onClose = () => {
    if (isSubmitting) {
      return;
    }

    handleClose();
  };

  const dialogProps = {
    open,
    onClose,
    'aria-labelledby': 'developer-import-dialog-title',
    disableEscapeKeyDown: isSubmitting,
    'data-testid': 'developer-import-dialog',
  };
  const fieldConfigs = getFormFieldStaticConfigs();
  const urlTextFieldProps = {
    ...fieldConfigs.url,
    disabled: isSubmitting,
  };
  const submitButtonProps = {
    isSubmitting,
    onClick: handleSubmit,
    defaultText: texts.dialog.submitButton,
    loadingText: texts.dialog.submitting,
  };
  // const uploadErrorResultProps = {
  //   handleSubmit,
  //   isSubmitting,
  //   errorMessage: error as string,
  // };
  // const uploadSuccessResultProps = {
  //   countdown: closeDialogCountdown as number,
  //   message: `Successfully uploaded. Dialog will close in ${state.closeDialogCountdown} seconds.`,
  // };

  return (
    <StyledDialog {...dialogProps} fullScreen={isMobile}>
      <DialogTitle id="developer-import-dialog-title">
        {texts.dialog.title}
        <StyledCloseButton onClick={onClose} aria-label={texts.dialog.closeButton} disabled={isSubmitting}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" noValidate aria-label="Video URL validation form" sx={{ mt: 2 }}>
          <TextField value={url} onChange={onFormFieldChange('url')} {...urlTextFieldProps} />

          {/* {error && <UploadErrorResult {...uploadErrorResultProps} />}
          {error === '' && <UploadSuccessResult {...uploadSuccessResultProps} />} */}

          <SubmitButton {...submitButtonProps} />
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export { DialogComponent };
