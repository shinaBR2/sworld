import * as React from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
// import Typography from "@mui/material/Typography";
import { blue } from '@mui/material/colors';
import { Box, CardMedia, DialogContent } from '@mui/material';
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
