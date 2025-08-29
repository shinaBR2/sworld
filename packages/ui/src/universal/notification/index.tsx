import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface NotificationProps {
  notification: {
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  onClose: () => void;
}

const Notification = (props: NotificationProps) => {
  const { notification, onClose } = props;

  return (
    <Snackbar
      open={true}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {notification && (
        <Alert
          severity={notification.severity}
          onClose={onClose}
          variant="filled"
        >
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
};
export { Notification };
