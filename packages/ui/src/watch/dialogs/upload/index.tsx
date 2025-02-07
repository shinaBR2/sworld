import React, { useState } from 'react';
import { Auth, watchMutationHooks } from 'core';
import { canPlayUrls } from './utils';
import { DialogState } from './types';
import { DialogComponent } from './dialog';
import hooks, { commonHelpers } from 'core';
import { BulkConvertResponse } from 'core/watch/mutation-hooks';

const { useCountdown } = hooks;
interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLOSE_DELAY_MS = 3000;
const defaultState: DialogState = {
  title: '',
  urls: '',
  description: '',
  validating: false,
  results: [],
  error: null,
  success: null,
  closeDialogCountdown: CLOSE_DELAY_MS / 1000,
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
  const { mutateAsync: bulkConvert, isPending: isSubmitting } = watchMutationHooks.useBulkConvertVideos({
    getAccessToken,
  });

  /**
   * Uncomment these lines for testing
   */
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const bulkConvert = async _data => {
  //   setIsSubmitting(true);

  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       setIsSubmitting(false);
  //       const response = {
  //         success: {
  //           insert_videos: {
  //             returning: [
  //               {
  //                 id: '123',
  //                 title: 'asad',
  //                 description: '1333',
  //               },
  //             ],
  //           },
  //         },
  //       };
  //       setState(prev => {
  //         return {
  //           ...prev,
  //           ...response,
  //         };
  //       });
  //       resolve(response);
  //     }, 2500);
  //   });
  // };

  const handleClose = () => {
    setState({
      ...defaultState,
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
      const { title, description = '', results } = state;
      const validUrls = results.filter(result => result.isValid).map(result => result.url);

      const response = (await bulkConvert({
        objects: validUrls.map(url => ({
          title,
          description,
          slug: commonHelpers.slugify(title),
          video_url: url,
        })),
      })) as BulkConvertResponse;

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

  useCountdown({
    duration: CLOSE_DELAY_MS / 1000,
    enabled: !!state.success,
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
      validateUrls={validateUrls}
      onTitleChange={onTitleChange}
      onUrlsChange={onUrlsChange}
      onDescriptionChange={onDescriptionChange}
      handleSubmit={handleSubmit}
      isBusy={isBusy}
      isSubmitting={isSubmitting}
      showSubmitButton={showSubmitButton}
    />
  );
};

export { VideoUploadDialog };
