import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface NotificationProps {
  notification: {
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  onClose: () => void;
}

// TODO: move to core
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
        <Alert severity={notification.severity} onClose={onClose} variant="filled">
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
};
export { Notification };
