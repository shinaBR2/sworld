import { Grid } from '@mui/material';
import type React from 'react';
import { LandingCard, type LandingCardProps } from '../landing-card';

interface LandingGridProps {
  items: Array<Omit<LandingCardProps, 'LinkComponent'> & { to?: string }>;
  LinkComponent?: React.ElementType;
}

const LandingGrid = ({ items, LinkComponent }: LandingGridProps) => {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        my: 2,
      }}
    >
      {items.map((item) => (
        <Grid
          key={item.to}
          size={{
            xs: 6,
            md: 3,
          }}
        >
          <LandingCard
            icon={item.icon}
            title={item.title}
            LinkComponent={LinkComponent}
            to={item.to}
            isExternal={item.isExternal}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export { LandingGrid, type LandingGridProps };
