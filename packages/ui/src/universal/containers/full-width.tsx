import Box from '@mui/material/Box';
import { ReactNode } from 'react';

interface FullWidthContainerProps {
  children: ReactNode;
}

const FullWidthContainer = (props: FullWidthContainerProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {props.children}
    </Box>
  );
};

export { FullWidthContainer };
