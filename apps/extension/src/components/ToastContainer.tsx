import { Alert, Snackbar } from '@mui/material';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => (
  <>
    {toasts.map((toast, index) => (
      <Snackbar
        key={toast.id}
        open
        autoHideDuration={4000}
        onClose={() => onRemove(toast.id)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        style={{ bottom: `${16 + index * 60}px` }}
      >
        <Alert
          onClose={() => onRemove(toast.id)}
          severity={toast.severity}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    ))}
  </>
);

export { ToastContainer };
