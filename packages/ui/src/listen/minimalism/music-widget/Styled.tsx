import Box, { type BoxProps } from '@mui/material/Box';
import Card, { type CardProps } from '@mui/material/Card';
import { keyframes, styled } from '@mui/material/styles';

const cardWidth = 345;

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  const { palette } = theme;

  return {
    width: cardWidth,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    // One calm light surface that matches the page — no dark slab.
    backgroundColor: palette.background.paper,
    color: palette.text.primary,
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
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
    bottom: 0,
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
