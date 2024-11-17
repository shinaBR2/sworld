import {
  Box,
  BoxProps,
  Card,
  CardActions,
  CardActionsProps,
  CardMedia,
  CardMediaProps,
  CardProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  return {
    aspectRatio: 1.75,
  };
}) as typeof Card;

export { StyledCard };
