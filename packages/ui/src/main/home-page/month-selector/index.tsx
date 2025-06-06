import { Box, IconButton, Typography, Card } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export interface MonthSelectorProps {
  displayMonth: string; // Format: "January 2024"
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  disableNext?: boolean;
  disablePrevious?: boolean;
  variant?: 'card' | 'plain';
}

const MonthSelector = ({
  displayMonth,
  onPreviousMonth,
  onNextMonth,
  disableNext = false,
  disablePrevious = false,
  variant = 'card',
}: MonthSelectorProps) => {
  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <IconButton onClick={onPreviousMonth} disabled={disablePrevious} size="small" color="primary">
        <ChevronLeft />
      </IconButton>

      <Typography variant="h6" component="div" fontWeight="medium">
        {displayMonth}
      </Typography>

      <IconButton onClick={onNextMonth} disabled={disableNext} size="small" color="primary">
        <ChevronRight />
      </IconButton>
    </Box>
  );

  if (variant === 'plain') {
    return content;
  }

  return <Card sx={{ p: 1.5 }}>{content}</Card>;
};

export { MonthSelector };
