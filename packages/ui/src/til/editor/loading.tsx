import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const EditorLoading = () => {
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

export { EditorLoading };
