import Box, { type BoxProps } from '@mui/material/Box';
import Card, { type CardProps } from '@mui/material/Card';
import { keyframes, styled } from '@mui/material/styles';

const cardWidth = 345;

// The one panel language for the listen screen. Both the player card and the
// song list share this soft surface so they read as the same app — string
// literals so the identical values are valid in both a styled() block and an
// sx prop (where a numeric borderRadius would be multiplied by the theme).
const panelSurface = {
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
} as const;

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
    ...panelSurface,
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

export {
  StyledCard,
  StyledContent,
  StyledPlayingList,
  pulseAnimation,
  panelSurface,
};
