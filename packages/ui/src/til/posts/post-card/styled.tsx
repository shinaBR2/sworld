import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '100%',
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  // Background, border and shadow are owned by the theme's Card override — only
  // layout, radius and the hover lift belong here.
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
})) as typeof Card;

export const StyledDescription = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.8,
  marginBottom: '16px',
}) as typeof Typography;

export const ReadTimeBadge = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  fontWeight: 500,
  fontSize: '0.75rem',
  letterSpacing: '0.025em',
})) as typeof Typography;
