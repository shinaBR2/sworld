import { BackdropProps } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingBackdropProps extends Omit<BackdropProps, 'open'> {
  message?: string;
}

// https://mui.com/material-ui/react-backdrop/
const LoadingBackdrop = (props: LoadingBackdropProps) => {
  const { message } = props;

  return (
    <Backdrop {...props} open={true}>
      <Box textAlign="center">
        <CircularProgress />
        {!!message && <Typography color="common.white">{message}</Typography>}
      </Box>
    </Backdrop>
  );
};

export default LoadingBackdrop;
