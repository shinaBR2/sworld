import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

interface PostEditFooterProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

const PostEditFooter = (props: PostEditFooterProps) => {
  const { onCancel, onSave, isSaving, canSave } = props;

  return (
    <Container
      maxWidth={false}
      sx={{ py: 2, borderTop: 1, borderColor: 'divider' }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving || !canSave}
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
    </Container>
  );
};

export { PostEditFooter };
