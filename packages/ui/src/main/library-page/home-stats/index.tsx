import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import {
  Check as CheckIcon,
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

interface StatsData {
  completed: number;
  currentlyReading: number;
  readingTimeThisMonth: number;
  wishlist: number;
}

interface StatsGridProps {
  isLoading: boolean;
  stats: StatsData;
}

const statItems = [
  {
    key: 'completed',
    label: 'Books Completed',
    icon: CheckIcon,
    color: '#16a34a',
    bgcolor: '#dcfce7',
    suffix: '',
  },
  {
    key: 'currentlyReading',
    label: 'Currently Reading',
    icon: BookIcon,
    color: '#2563eb',
    bgcolor: '#dbeafe',
    suffix: '',
  },
  {
    key: 'readingTimeThisMonth',
    label: 'This Month',
    icon: ScheduleIcon,
    color: '#9333ea',
    bgcolor: '#f3e8ff',
    suffix: 'h',
  },
  {
    key: 'wishlist',
    label: 'Wishlist',
    icon: FavoriteIcon,
    color: '#ea580c',
    bgcolor: '#fed7aa',
    suffix: '',
  },
] as const;

const StatsGridSkeleton = () => {
  return (
    <Box sx={{ mb: 6 }} aria-busy="true" aria-label="Stats section loading">
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {statItems.map(item => {
          const IconComponent = item.icon;

          return (
            <Grid item xs={6} md={3} key={item.key}>
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
                    height={28}
                    aria-hidden="true"
                    data-testid={`stats-value-skeleton-${item.key}`}
                    sx={{
                      fontSize: '1.5rem',
                      mb: 0.5,
                      mx: 'auto',
                    }}
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

const StatsGrid: React.FC<StatsGridProps> = props => {
  const { isLoading, stats } = props;

  if (isLoading) {
    return <StatsGridSkeleton />;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {statItems.map(item => {
          const IconComponent = item.icon;
          const value = stats[item.key];

          return (
            <Grid item xs={6} md={3} key={item.key}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: item.bgcolor,
                      color: item.color,
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
                  <Typography variant="body2" color="text.secondary">
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
