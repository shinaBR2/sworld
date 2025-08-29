import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import type { MuiStyledProps } from '../../types';

interface FullWidthContainerProps extends MuiStyledProps {
  children: ReactNode;
}

const FullWidthContainer = (props: FullWidthContainerProps) => {
  const { sx, children } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export { FullWidthContainer };
