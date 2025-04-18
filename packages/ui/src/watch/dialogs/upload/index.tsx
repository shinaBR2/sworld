import React, { useState } from 'react';
import { buildVariables, CLOSE_DELAY_MS } from './utils';
import { DialogState } from './types';
import { DialogComponent } from './dialog';
import { texts } from './texts';
import { useAuthContext } from 'core/providers/auth';
import { useBulkConvertVideos } from 'core/watch/mutation-hooks/bulk-convert';
import { useCountdown } from 'core/universal/hooks/useCooldown';
import { useLoadPlaylists } from 'core/watch/query-hooks/playlists';
import { validateForm } from './validate';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultState: DialogState = {
  title: '',
  url: '',
  subtitle: '',
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

  // TODO: handle loading + errors
  const { playlists } = useLoadPlaylists({
    getAccessToken,
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onFormFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({
      ...prev,
      [field]: newValue,
      error: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    const error = validateForm(state);
    if (error) {
      return setState(prev => ({
        ...prev,
        isSubmitting: false,
        error,
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
      onFormFieldChange={onFormFieldChange}
      handleSubmit={handleSubmit}
    />
  );
};

export { VideoUploadDialog };
