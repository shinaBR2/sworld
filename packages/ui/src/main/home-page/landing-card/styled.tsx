import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
})) as typeof Card;

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'customColor',
})<{ customColor?: string }>(({ theme, customColor }) => ({
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: `${customColor || theme.palette.primary.main}15`,
})) as typeof Box;

const IconTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'customColor',
})<{ customColor?: string }>(({ customColor, theme }) => ({
  fontSize: '2rem',
  color: customColor || theme.palette.primary.main,
})) as typeof Typography;

const TitleTypography = styled(Typography)(() => ({
  fontWeight: 600,
})) as typeof Typography;

export { IconContainer, IconTypography, StyledCard, TitleTypography };
