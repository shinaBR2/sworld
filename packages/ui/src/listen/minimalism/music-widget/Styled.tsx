import {
  Box,
  BoxProps,
  Card,
  CardActions,
  CardActionsProps,
  CardProps,
} from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

const cardWidth = 345;

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  const { palette } = theme;

  return {
    width: cardWidth,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: cardWidth,
    },
    background: `linear-gradient(to bottom, ${palette.grey[900]}, ${palette.grey[800]})`,
    color: palette.common.white,
  };
}) as typeof Card;

const StyledContent = styled('div')<BoxProps>(() => {
  return {
    position: 'relative',
  };
}) as any;

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

/**
 * For Music widget playing list
 */
const pulseAnimation = keyframes`
  0% { opacity: 0.6 }
  50% { opacity: 1 }
  100% { opacity: 0.6 }
`;

export { StyledCard, StyledContent, StyledPlayingList, pulseAnimation };
