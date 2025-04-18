import React from 'react';
import {
  StyledCard,
  IconContainer,
  IconTypography,
  TitleTypography,
  DescriptionTypography,
  CardContentBox,
} from './styled';

interface LandingCardProps {
  icon: string;
  title: string;
  LinkComponent?: React.ElementType;
  to?: string;
  isExternal?: boolean;
  description?: string;
  color?: string;
}

const LandingCard = ({ icon, title, LinkComponent, to, isExternal, description, color }: LandingCardProps) => {
  const CardContent = () => (
    <>
      <IconContainer customColor={color}>
        <IconTypography variant="h3" customColor={color}>
          {icon}
        </IconTypography>
      </IconContainer>
      <TitleTypography variant="h6">{title}</TitleTypography>
      {description && <DescriptionTypography variant="body2">{description}</DescriptionTypography>}
    </>
  );

  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <StyledCard>
          <CardContentBox>
            <CardContent />
          </CardContentBox>
        </StyledCard>
      </a>
    );
  }

  // If LinkComponent is provided, wrap the content with it
  if (LinkComponent) {
    return (
      <LinkComponent to={to} style={{ textDecoration: 'none' }}>
        <StyledCard>
          <CardContentBox>
            <CardContent />
          </CardContentBox>
        </StyledCard>
      </LinkComponent>
    );
  }

  // Otherwise, just render the card without a link
  return (
    <StyledCard>
      <CardContentBox>
        <CardContent />
      </CardContentBox>
    </StyledCard>
  );
};

export { LandingCard, type LandingCardProps };
