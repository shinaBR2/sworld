import React from 'react';
import { Box, Typography } from '@mui/material';
import { StyledCard } from './styled';

interface LandingCardProps {
  icon: string;
  title: string;
  LinkComponent?: React.ElementType;
  to?: string;
}

const LandingCard = ({ icon, title, LinkComponent, to }: LandingCardProps) => {
  const CardContent = () => (
    <>
      <Typography variant="h3" sx={{ mb: 1, fontSize: '2.5rem' }}>
        {icon}
      </Typography>
      <Typography variant="subtitle1" fontWeight="medium">
        {title}
      </Typography>
    </>
  );

  // If LinkComponent is provided, wrap the content with it
  if (LinkComponent) {
    return (
      <StyledCard>
        <LinkComponent to={to}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
            <CardContent />
          </Box>
        </LinkComponent>
      </StyledCard>
    );
  }

  // Otherwise, just render the card without a link
  return (
    <StyledCard>
      <CardContent />
    </StyledCard>
  );
};

export { LandingCard, type LandingCardProps };
