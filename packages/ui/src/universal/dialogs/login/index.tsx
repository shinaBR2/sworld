import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';

interface LoginDialogProps {
  onAction?: () => void;
}

const texts = {
  welcome: 'Welcome Back',
  cta: 'FLOW',
};

export const LoginDialog = (props: LoginDialogProps) => {
  const { onAction } = props;

  return (
    <Dialog open={true} onClose={() => {}} disableEscapeKeyDown={true}>
      <DialogContent sx={{ width: 400, maxWidth: '100%', py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Typography variant="h5">{texts.welcome}</Typography>
          <Button variant="outlined" startIcon={<GoogleIcon />} sx={{ width: '100%', py: 1 }} onClick={onAction}>
            {texts.cta}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
