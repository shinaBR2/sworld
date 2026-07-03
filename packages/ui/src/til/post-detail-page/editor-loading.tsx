import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const PostEditorLoading = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export { PostEditorLoading };
