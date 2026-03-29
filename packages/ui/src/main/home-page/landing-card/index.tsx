import { CardContent } from '@mui/material';
import type React from 'react';
import {
  IconContainer,
  IconTypography,
  StyledCard,
  TitleTypography,
} from './styled';

interface LandingCardProps {
  icon: string;
  title: string;
  LinkComponent?: React.ElementType;
  to?: string;
  isExternal?: boolean;
  color?: string;
}

const LandingCard = ({
  icon,
  title,
  LinkComponent,
  to,
  isExternal,
  color,
}: LandingCardProps) => {
  const cardContent = (
    <CardContent sx={{ textAlign: 'center' }}>
      <IconContainer customColor={color}>
        <IconTypography variant="h3" customColor={color}>
          {icon}
        </IconTypography>
      </IconContainer>
      <TitleTypography variant="h6">{title}</TitleTypography>
    </CardContent>
  );

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      >
        <StyledCard>{cardContent}</StyledCard>
      </a>
    );
  }

  if (LinkComponent) {
    return (
      <LinkComponent
        to={to}
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      >
        <StyledCard>{cardContent}</StyledCard>
      </LinkComponent>
    );
  }

  return <StyledCard>{cardContent}</StyledCard>;
};

export { LandingCard, type LandingCardProps };
