import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const LookEmptyState = () => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1, py: 8 }}>
    <Typography variant="h6" component="p" sx={{ color: 'text.primary' }}>
      No photos yet
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Photos you add will appear here, grouped by month.
    </Typography>
  </Stack>
);

export { LookEmptyState };
