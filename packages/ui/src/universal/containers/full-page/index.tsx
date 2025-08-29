import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import type { MuiStyledProps } from '../../types';

interface FullPageContainerProps extends MuiStyledProps {
  children: ReactNode;
}

const FullPageContainer = (props: FullPageContainerProps) => {
  const { sx, children } = props;

  return (
    <Stack
      useFlexGap
      spacing={0}
      sx={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden', ...sx }}
    >
      {children}
    </Stack>
  );
};

export { FullPageContainer };
