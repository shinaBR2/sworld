import Card from '@mui/material/Card';
import { CardProps } from '@mui/material';
import styled from '@emotion/styled';

const StyledCard = styled(Card)<CardProps>(() => {
  return {
    aspectRatio: 1.75,
  };
}) as typeof Card;

export { StyledCard };
