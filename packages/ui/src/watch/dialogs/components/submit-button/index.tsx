import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';

interface SubmitButtonProps {
  isSubmitting: boolean;
  onClick: (e: React.FormEvent) => void;
  defaultText: string;
  loadingText: string;
}

const LoadingState = React.memo(({ text }: { text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} color="inherit" />
    {text}
  </Box>
));
LoadingState.displayName = 'LoadingState';

const SubmitButton = (props: SubmitButtonProps) => {
  const { isSubmitting, onClick, defaultText, loadingText } = props;

  const renderContent = () => {
    if (isSubmitting) return <LoadingState text={loadingText} />;

    return defaultText;
  };

  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={isSubmitting}
      sx={{ mb: 2 }}
      aria-busy={isSubmitting}
      onClick={onClick}
    >
      {renderContent()}
    </Button>
  );
};

export { SubmitButton };
