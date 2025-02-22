import Stack from '@mui/material/Stack';
import { ReactNode } from 'react';

interface FullPageContainerProps {
  children: ReactNode;
}

const FullPageContainer = (props: FullPageContainerProps) => {
  return (
    <Stack useFlexGap spacing={0} sx={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      {props.children}
    </Stack>
  );
};

export { FullPageContainer };
