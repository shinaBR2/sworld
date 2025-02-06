import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { texts } from './texts';

interface SubmitButtonProps {
  isBusy: boolean;
  isSubmitting: boolean;
  validating: boolean;
  showSubmitButton: boolean;
  urls: string;
  onClick: (e: React.FormEvent) => void;
}

const LoadingState = ({ text }: { text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} color="inherit" />
    {text}
  </Box>
);

const SubmitButton = (props: SubmitButtonProps) => {
  const { isBusy, isSubmitting, validating, showSubmitButton, urls, onClick } = props;
  const { submitButton } = texts.form;

  const renderContent = () => {
    if (isSubmitting) return <LoadingState text={submitButton.submitting} />;
    if (validating) return <LoadingState text={submitButton.validating} />;
    if (showSubmitButton) return submitButton.submit;
    return submitButton.default;
  };

  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={isBusy || !urls.trim()}
      sx={{ mb: 2 }}
      aria-busy={isBusy}
      onClick={onClick}
    >
      {renderContent()}
    </Button>
  );
};

export { SubmitButton };
