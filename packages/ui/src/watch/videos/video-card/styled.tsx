import Card, { type CardProps } from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

const StyledCard = styled(Card)<CardProps>(({ theme }) => {
  const { palette } = theme;

  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'none',
    bgcolor: 'transparent',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
      cursor: 'pointer',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: palette.primary.main,
      transform: 'scale(1.02)',
    },
  };
}) as typeof Card;

const StyledDuration = styled(Typography)<TypographyProps>(({ theme }) => {
  const { palette } = theme;

  return {
    position: 'absolute',
    bottom: 8,
    right: 8,
    bgcolor: palette.action.disabledBackground,
    color: palette.common.white,
    px: 1,
    py: 0.5,
    borderRadius: 1,
    fontWeight: 500,
  };
}) as typeof Typography;

const StyledTitle = styled(Typography)<TypographyProps>(({ theme }) => {
  return {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    lineClamp: 2,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    mb: 0.5,
    lineHeight: theme.typography.body1.lineHeight,
  };
}) as typeof Typography;

export { StyledCard, StyledDuration, StyledTitle };
