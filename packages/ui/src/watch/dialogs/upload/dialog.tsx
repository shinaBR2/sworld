import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Fade,
  MenuItem,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { texts } from './texts';
import { StyledDialog, StyledCloseButton } from './styled';
import { SubmitButton } from './submit-button';
import { DialogState } from './types';
import { CLOSE_DELAY_MS } from '.';
import { getFormFieldStaticConfigs } from './fields-config';
import { useLoadPlaylists } from 'core/watch/query-hooks/playlists';

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
  onPlaylistIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPlaylistNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoPositionInPlaylistChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface UploadSuccessResultProps {
  countdown: number;
  message: string;
}

const UploadSuccessResult = (props: UploadSuccessResultProps) => {
  const { message, countdown } = props;
  const totalTime = CLOSE_DELAY_MS / 1000;

  return (
    <Fade in>
      <Alert
        severity="success"
        sx={{ mb: 2 }}
        action={<CircularProgress variant="determinate" value={(countdown / totalTime) * 100} size={20} />}
      >
        {message}
      </Alert>
    </Fade>
  );
};

interface DialogComponentProps {
  state: DialogState;
  open: boolean;
  handleClose: () => void;
  playlists: ReturnType<typeof useLoadPlaylists>['playlists'];
  formProps: FormProps;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Raw UI component for storybook
 * @param props
 * @returns
 */
const DialogComponent = (props: DialogComponentProps) => {
  const { state, open, handleClose, formProps, playlists, handleSubmit } = props;
  const {
    onTitleChange,
    onUrlChange,
    onDescriptionChange,
    onPlaylistIdChange,
    onNewPlaylistNameChange,
    onVideoPositionInPlaylistChange,
  } = formProps;
  const {
    isSubmitting,
    title,
    url,
    description,
    playlistId,
    newPlaylistName,
    videoPositionInPlaylist,
    error,
    closeDialogCountdown,
  } = state;

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
    disableEscapeKeyDown: isSubmitting,
    'data-testid': 'upload-video-dialog',
  };
  const fieldConfigs = getFormFieldStaticConfigs();
  const titleTextFieldProps = {
    ...fieldConfigs.title,
    disabled: isSubmitting,
  };
  const urlTextFieldProps = {
    ...fieldConfigs.url,
    disabled: isSubmitting,
  };
  const descriptionTextFieldProps = {
    ...fieldConfigs.description,
    disabled: isSubmitting,
  };
  const playlistTextFieldProps = {
    ...fieldConfigs.playlist,
    disabled: isSubmitting,
  };
  const videoPositionInPlaylistTextFieldProps = {
    ...fieldConfigs.videoPositionInPlaylist,
    disabled: isSubmitting,
  };
  const submitButtonProps = {
    isSubmitting,
    onClick: handleSubmit,
  };
  const uploadErrorResultProps = {
    handleSubmit,
    isSubmitting,
    errorMessage: error as string,
  };
  const uploadSuccessResultProps = {
    countdown: closeDialogCountdown as number,
    message: `Successfully uploaded. Dialog will close in ${state.closeDialogCountdown} seconds.`,
  };
  const CREATE_NEW_PLAYLIST = 'create-new';

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
          <TextField value={title} onChange={onTitleChange} {...titleTextFieldProps} />
          <TextField value={url} onChange={onUrlChange} {...urlTextFieldProps} />
          <TextField value={description} onChange={onDescriptionChange} {...descriptionTextFieldProps} />
          <TextField select value={playlistId} onChange={onPlaylistIdChange} {...playlistTextFieldProps}>
            <MenuItem value="">
              <em>{texts.form.playlistInput.none}</em>
            </MenuItem>
            <MenuItem value={CREATE_NEW_PLAYLIST}>
              <em>{texts.form.playlistInput.createNew}</em>
            </MenuItem>
            {playlists.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            value={videoPositionInPlaylist || 0}
            onChange={onVideoPositionInPlaylistChange}
            {...videoPositionInPlaylistTextFieldProps}
          />

          {playlistId === CREATE_NEW_PLAYLIST && (
            <TextField
              fullWidth
              label="New Playlist Name"
              value={newPlaylistName || ''}
              onChange={onNewPlaylistNameChange}
              margin="normal"
              required
              disabled={isSubmitting}
              error={playlistId === CREATE_NEW_PLAYLIST && !newPlaylistName}
              helperText={playlistId === CREATE_NEW_PLAYLIST && !newPlaylistName ? 'Playlist name is required' : ''}
            />
          )}

          {error && <UploadErrorResult {...uploadErrorResultProps} />}
          {error === '' && <UploadSuccessResult {...uploadSuccessResultProps} />}

          <SubmitButton {...submitButtonProps} />
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export { DialogComponent };
