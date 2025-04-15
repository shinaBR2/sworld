import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const ChartContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  minHeight: 240,
  width: '100%',
})) as typeof Box;

const BreakdownCard = styled(Card)(() => ({
  height: '100%',
})) as typeof Card;

export { ChartContainer, BreakdownCard };
