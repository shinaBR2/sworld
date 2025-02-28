import React, { useState } from 'react';
import { buildVariables, canPlayUrls } from './utils';
import { DialogState } from './types';
import { DialogComponent } from './dialog';
import { texts } from './texts';
import { useAuthContext } from 'core/providers/auth';
import { useBulkConvertVideos } from 'core/watch/mutation-hooks/bulk-convert';
import { useCountdown } from 'core/universal/hooks/useCooldown';
import { useLoadPlaylists } from 'core/watch/query-hooks/playlists';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLOSE_DELAY_MS = 3000;
const defaultState: DialogState = {
  title: '',
  url: '',
  description: '',
  isSubmitting: false,
  error: null,
  closeDialogCountdown: null,
};

/**
 * Stateful component holding state and hooks
 * @param param0
 * @returns
 */
const VideoUploadDialog = ({ open, onOpenChange }: VideoUploadDialogProps) => {
  const [state, setState] = useState<DialogState>({
    ...defaultState,
  });

  const { getAccessToken } = useAuthContext();
  const { mutateAsync: bulkConvert } = useBulkConvertVideos({
    getAccessToken,
  });
  const { isLoading, playlists } = useLoadPlaylists({
    getAccessToken,
  });
  console.log(`fetching playlists`, isLoading);
  // const {} = useLoadPlaylists();

  const handleClose = () => {
    onOpenChange(false);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({
      ...prev,
      title: newValue,
    }));
  };
  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({
      ...prev,
      description: newValue,
    }));
  };
  const onUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setState(prev => ({
      ...prev,
      url: newValue,
      error: null,
    }));
  };
  const onPlaylistIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setState(prev => ({
      ...prev,
      playlistId: newValue,
      error: null,
    }));
  };
  const onNewPlaylistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setState(prev => ({
      ...prev,
      newPlaylistName: newValue,
      error: null,
    }));
  };
  const onVideoPositionInPlaylistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    setState(prev => ({
      ...prev,
      videoPositionInPlaylist: parseInt(newValue),
      error: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    const validationResults = await canPlayUrls([state.url]);
    const isValid = validationResults.length === 1 && validationResults[0].isValid;

    if (!isValid) {
      return setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: texts.errors.invalidUrl,
      }));
    }

    try {
      const variables = buildVariables(state);
      const response = await bulkConvert(variables);

      if (response.insert_videos?.returning.length !== 1) {
        // Unknown error
        return setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: texts.errors.failedToSave,
        }));
      }

      setState({
        ...defaultState,
        error: '', // Trigger cooldown
        closeDialogCountdown: CLOSE_DELAY_MS / 1000,
      });
    } catch (error) {
      // TODO
      // Determine retry ability
      const errorMessage = error instanceof Error ? error.message : texts.errors.unexpected;
      setState(prev => ({ ...prev, isSubmitting: false, error: errorMessage }));
    }
  };

  useCountdown({
    duration: CLOSE_DELAY_MS / 1000,
    enabled: state.error === '' && !!state.closeDialogCountdown,
    onTick: (remaining: number) => {
      setState(prev => ({
        ...prev,
        closeDialogCountdown: remaining,
      }));
    },
    onComplete: handleClose,
  });

  return (
    <DialogComponent
      open={open}
      state={state}
      handleClose={handleClose}
      playlists={playlists}
      formProps={{
        onTitleChange,
        onUrlChange,
        onDescriptionChange,
        onPlaylistIdChange,
        onNewPlaylistNameChange,
        onVideoPositionInPlaylistChange,
      }}
      handleSubmit={handleSubmit}
    />
  );
};

export { VideoUploadDialog, CLOSE_DELAY_MS };
