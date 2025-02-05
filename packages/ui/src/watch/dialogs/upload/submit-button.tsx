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

const SubmitButton = (props: SubmitButtonProps) => {
  const { isBusy, isSubmitting, validating, showSubmitButton, urls, onClick } = props;
  const { submitButton } = texts.form;

  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={isBusy || !urls.trim()}
      sx={{ mb: 2 }}
      aria-busy={isBusy}
      onClick={e => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {isSubmitting ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          {submitButton.submitting}
        </Box>
      ) : validating ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          {submitButton.validating}
        </Box>
      ) : showSubmitButton ? (
        submitButton.submit
      ) : (
        submitButton.default
      )}
    </Button>
  );
};

export { SubmitButton };
