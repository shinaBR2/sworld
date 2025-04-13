import React from 'react';
import { Grid } from '@mui/material';
import { LandingCard, LandingCardProps } from '../landing-card';

interface LandingGridProps {
  items: Array<Omit<LandingCardProps, 'LinkComponent'> & { to?: string }>;
  LinkComponent?: React.ElementType;
}

const LandingGrid = ({ items, LinkComponent }: LandingGridProps) => {
  return (
    <Grid container spacing={2}>
      {items.map((item, index) => (
        <Grid item xs={6} md={3} key={index}>
          <LandingCard icon={item.icon} title={item.title} LinkComponent={LinkComponent} to={item.to} />
        </Grid>
      ))}
    </Grid>
  );
};

export { LandingGrid, type LandingGridProps };
