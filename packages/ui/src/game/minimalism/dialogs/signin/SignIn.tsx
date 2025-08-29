import { Box, CardMedia, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { GoogleIcon } from './CustomIcons';

export interface SignInProps {
  open: boolean;
  onSubmit: () => void;
}

const SignIn = (props: SignInProps) => {
  const { onSubmit, open } = props;

  return (
    <Dialog open={open}>
      <DialogTitle>Sign in</DialogTitle>
      <DialogContent>
        <CardMedia
          sx={{ objectFit: 'cover', width: '100%', minHeight: '120px' }}
          image="/assets/beach.png"
          title="beach"
        />
        <Box mt={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onSubmit}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SignIn;
