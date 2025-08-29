import type { StyledComponent } from '@emotion/styled';
import {
  Box,
  type BoxProps,
  Card,
  Typography,
  type TypographyProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  boxShadow: theme.shadows[2],
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : theme.palette.background.paper,
  },
})) as typeof Card;

const IconContainer: StyledComponent<BoxProps & { customColor?: string }> =
  styled(Box, {
    shouldForwardProp: (prop) => prop !== 'customColor',
  })<{ customColor?: string }>(({ theme, customColor }) => {
    const iconColor = customColor || theme.palette.primary.main;
    return {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      height: 70,
      borderRadius: '50%',
      backgroundColor: `${iconColor}15`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        backgroundColor: `${iconColor}25`,
      },
    };
  });

const IconTypography: StyledComponent<
  TypographyProps & { customColor?: string }
> = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'customColor',
})<{ customColor?: string }>(({ theme, customColor }) => ({
  fontSize: '2rem',
  color: customColor || theme.palette.primary.main,
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  transition: 'color 0.3s ease',
})) as typeof Typography;

const DescriptionTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: '85%',
})) as typeof Typography;

const CardContentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: theme.spacing(3),
})) as typeof Box;

export {
  StyledCard,
  IconContainer,
  IconTypography,
  TitleTypography,
  DescriptionTypography,
  CardContentBox,
};
