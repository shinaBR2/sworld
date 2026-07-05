import {
  MenuBook as BookIcon,
  Check as CheckIcon,
  Favorite as FavoriteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type React from 'react';

interface StatsData {
  totalBooks?: number;
  completedBooks: number;
  currentlyReading: number;
  readingTimeThisMonth: number;
  wishlist: number;
}

interface StatsGridProps {
  isLoading: boolean;
  stats: StatsData | null;
}

// `color` is a theme palette key so each tile reads from a mode-aware token
// (the old hardcoded pastel `bgcolor` was light-only — invisible in dark mode).
// The icon circle background is derived from the same colour via alpha().
const statItems = [
  {
    key: 'completedBooks',
    label: 'Books Completed',
    icon: CheckIcon,
    color: 'success',
    suffix: '',
  },
  {
    key: 'currentlyReading',
    label: 'Currently Reading',
    icon: BookIcon,
    color: 'info',
    suffix: '',
  },
  {
    key: 'readingTimeThisMonth',
    label: 'This Month',
    icon: ScheduleIcon,
    color: 'secondary',
    suffix: 'h',
  },
  {
    key: 'wishlist',
    label: 'Wishlist',
    icon: FavoriteIcon,
    color: 'warning',
    suffix: '',
  },
] as const;

const StatsGridSkeleton = () => {
  return (
    <Box sx={{ mb: 6 }} aria-busy="true" aria-label="Stats section loading">
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {statItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <Grid
              key={item.key}
              size={{
                xs: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  {/* Icon - Same as actual with muted colors */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'grey.200',
                      color: 'grey.400',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 24 }} />
                  </Box>

                  {/* Value skeleton */}
                  <Skeleton
                    variant="text"
                    width={40}
                    height="1.7rem"
                    aria-hidden="true"
                    data-testid={`stats-value-skeleton-${item.key}`}
                    sx={{ mb: '4px', mx: 'auto' }}
                  />

                  {/* Label skeleton */}
                  <Skeleton
                    variant="text"
                    width="70%"
                    aria-hidden="true"
                    data-testid={`stats-label-skeleton-${item.key}`}
                    sx={{
                      fontSize: '0.875rem',
                      mx: 'auto',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const StatsGrid: React.FC<StatsGridProps> = (props) => {
  const { isLoading, stats } = props;
  const theme = useTheme();

  if (isLoading) {
    return <StatsGridSkeleton />;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {statItems.map((item) => {
          const IconComponent = item.icon;
          let value = stats?.[item.key] ?? 0;
          // Convert minutes to hours for readingTimeThisMonth
          if (item.key === 'readingTimeThisMonth') {
            value = Math.round(value / 60);
          }
          const tileColor = theme.palette[item.color].main;

          return (
            <Grid
              key={item.key}
              size={{
                xs: 6,
                md: 3,
              }}
            >
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: alpha(tileColor, 0.15),
                      color: tileColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontSize: '1.5rem', mb: 0.5 }}>
                    {value ?? 0}
                    {item.suffix || ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {item.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export { StatsGrid };
