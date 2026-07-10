import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import type { ImportStatus } from 'core/universal/extension/communication/types';
import { ImportStatusBadge } from './ImportStatusBadge';

interface RecentTabProps {
  imports: ImportStatus[];
  onRetry: (importId: string) => void;
}

const RecentTab = ({ imports, onRetry }: RecentTabProps) => {
  if (imports.length === 0) {
    return (
      <Box p={2}>
        <Typography color="text.secondary" align="center">
          No recent imports.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="subtitle2" gutterBottom>
        Recent Imports
      </Typography>
      <List disablePadding>
        {imports.map((imp) => (
          <ListItem
            key={imp.importId}
            divider
            secondaryAction={
              imp.status === 'failed' ? (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onRetry(imp.importId)}
                >
                  Retry
                </Button>
              ) : null
            }
          >
            <ListItemText
              primary={imp.title || imp.importId}
              secondary={
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <ImportStatusBadge status={imp.status} />
                  <Typography variant="caption">{imp.targetApp}</Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export { RecentTab };
