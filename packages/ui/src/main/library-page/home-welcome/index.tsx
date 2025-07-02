import { Box, Skeleton } from '@mui/material';
import { useAuthContext } from 'core/providers/auth';

const Welcome = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }} aria-busy="true" aria-label="Welcome section loading">
        <Box sx={{ mb: 1 }}>
          <Skeleton
            variant="text"
            width={280}
            height={45}
            aria-hidden="true"
            data-testid="welcome-title-skeleton"
            sx={{
              fontSize: '1.875rem',
              transform: 'scale(1, 1)',
            }}
          />
        </Box>
        <Skeleton variant="text" width={320} height={24} aria-hidden="true" data-testid="welcome-subtitle-skeleton" />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }} aria-busy="false" aria-label="Welcome section">
      <Box
        component="h2"
        sx={{
          fontSize: '1.875rem',
          fontWeight: 700,
          mb: 1,
          color: 'text.primary',
          m: 0,
        }}
      >
        Welcome back, {user?.name}!
      </Box>
      <Box component="p" sx={{ color: 'text.secondary', m: 0 }}>
        Continue your reading journey or discover something new.
      </Box>
    </Box>
  );
};

export { Welcome };
