import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, ReactNode } from 'react';

interface WriteFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  error: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

const WriteForm = (props: WriteFormProps) => {
  const {
    title,
    onTitleChange,
    error,
    isSubmitting,
    canSubmit,
    onCancel,
    onSubmit,
    children,
  } = props;

  return (
    <Stack sx={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <Container
        maxWidth={false}
        sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <TextField
          fullWidth
          placeholder="Post title..."
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onTitleChange(e.target.value)
          }
          disabled={isSubmitting}
          variant="standard"
          InputProps={{
            style: {
              fontSize: '1.5rem',
              fontWeight: 600,
            },
          }}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>

      {/* Editor */}
      {children}

      {/* Footer */}
      <Container
        maxWidth={false}
        sx={{
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            fullWidth
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </Stack>
      </Container>
    </Stack>
  );
};

export { WriteForm };
