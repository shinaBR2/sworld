import React, { useState } from 'react';
import { canPlayUrls } from './utils';
import { DialogState } from './types';
import { DialogComponent } from './dialog';
import hooks, { commonHelpers } from 'core';
import { BulkConvertResponse } from 'core/watch/mutation-hooks';
import { texts } from './texts';

const { useCountdown } = hooks;
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

  const { getAccessToken } = Auth.useAuthContext();
  const { mutateAsync: bulkConvert } = watchMutationHooks.useBulkConvertVideos({
    getAccessToken,
  });

  /**
   * Uncomment these lines for testing
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const bulkConvert = async _data => {
  //   setState(prev => ({
  //     ...prev,
  //     isSubmitting: true,
  //   }));

  //   return new Promise((_resolve, reject) => {
  //     setTimeout(() => {
  //       // const response = {
  //       //   insert_videos: {
  //       //     returning: [
  //       //       {
  //       //         id: '123',
  //       //         title: 'asad',
  //       //         description: '1333',
  //       //       },
  //       //     ],
  //       //   },
  //       // };
  //       // resolve(response);
  //       reject();
  //     }, 2500);
  //   });
  // };

  const handleClose = () => {
    // setState({
    //   ...defaultState,
    // });
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
      const { title, description = '', url } = state;
      const response = (await bulkConvert({
        objects: [
          {
            title,
            description,
            slug: commonHelpers.slugify(title),
            video_url: url,
          },
        ],
      })) as BulkConvertResponse;

      if (response.insert_videos.returning.length !== 1) {
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
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while uploading videos.';
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
      formProps={{
        onTitleChange,
        onUrlChange,
        onDescriptionChange,
      }}
      handleSubmit={handleSubmit}
      isSubmitting={state.isSubmitting}
    />
  );
};

export { VideoUploadDialog };
