import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
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

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
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
                    {value}
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
