import { Chip, CircularProgress } from '@mui/material';
import type { ImportStatus } from 'core/universal/extension/communication/types';

interface ImportStatusBadgeProps {
  status: ImportStatus['status'];
}

const statusConfig: Record<
  ImportStatus['status'],
  { label: string; color: 'default' | 'primary' | 'success' | 'error' }
> = {
  pending: { label: 'Pending', color: 'default' },
  importing: { label: 'Importing', color: 'primary' },
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
};

const ImportStatusBadge = ({ status }: ImportStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={status === 'importing' ? <CircularProgress size={12} /> : undefined}
    />
  );
};

export { ImportStatusBadge };
