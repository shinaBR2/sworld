import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '100%',
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid rgba(0,0,0,0.06)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08)',
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
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[600],
  fontWeight: 500,
  fontSize: '0.75rem',
  letterSpacing: '0.025em',
})) as typeof Typography;
