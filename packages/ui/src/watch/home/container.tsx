import Box from '@mui/material/Box';
import { ReactNode } from 'react';

interface HomeContainerProps {
  children: ReactNode;
}

const HomeContainer = (props: HomeContainerProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {props.children}
    </Box>
  );
};

export { HomeContainer };
