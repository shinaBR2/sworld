import styled from '@emotion/styled';
import type { CardProps } from '@mui/material';
import Card from '@mui/material/Card';

const StyledCard = styled(Card)<CardProps>(() => {
  return {
    aspectRatio: 1.75,
  };
}) as typeof Card;

export { StyledCard };
