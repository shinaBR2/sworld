import {
  Box,
  BoxProps,
  Card,
  CardActions,
  CardActionsProps,
  CardProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const cardWidth = 345;
const contentHeight = 300;

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  return {
    width: cardWidth,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: cardWidth,
    },
    background: 'linear-gradient(to bottom, #242424, #323232)',
    color: '#fff',
  };
}) as typeof Card;

const StyledContent = styled('div')<BoxProps>(() => {
  return {
    position: 'relative',
    height: contentHeight,
  };
}) as any;

const StyledCardActions = styled(CardActions)<CardActionsProps>(() => {
  return {
    display: 'block',
  };
}) as typeof CardActions;

const StyledPlayingList = styled(Box)<BoxProps>(({ theme }) => {
  return {
    position: 'absolute',
    width: '100%',
    height: '244px',
    top: 56,
    overflowY: 'auto',
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  };
}) as any;

export { StyledCard, StyledContent, StyledCardActions, StyledPlayingList };
