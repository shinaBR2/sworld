import React, { useEffect, useState } from 'react';
import { Auth, watchMutationHooks } from 'core';
import { canPlayUrls } from './utils';
import { DialogState } from './types';
import { DialogComponent } from './dialog';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLOSE_DELAY_MS = 3000;

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
  const { mutateAsync: bulkConvert, isPending: isSubmitting } = watchMutationHooks.useBulkConvertVideos({
    getAccessToken,
  });

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

export { VideoUploadDialog };
