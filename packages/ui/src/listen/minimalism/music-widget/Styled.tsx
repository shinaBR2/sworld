import Box, { type BoxProps } from '@mui/material/Box';
import Card, { type CardProps } from '@mui/material/Card';
import { keyframes, styled } from '@mui/material/styles';

const cardWidth = 345;

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  return {
    width: cardWidth,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    // Surface (background, border, radius, shadow) is painted by the theme's
    // Card override so a provider swap re-skins it — this only owns layout.
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
    // This list slides up directly over the player controls with no backdrop
    // scrim, so the base translucent glass Paper let them bleed through. Use the
    // theme's opaque `overlay` surface; fall back to Paper for any non-glass
    // theme (where Paper is already opaque) so the panel is never transparent.
    backgroundColor:
      theme.palette.background.overlay ?? theme.palette.background.paper,
    color: theme.palette.text.primary,
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
