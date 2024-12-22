import Container from '@mui/material/Container';
import { ReactNode } from 'react';

interface MainContainerProps {
  children: ReactNode;
}

const MainContainer = (props: MainContainerProps) => {
  return (
    <Container maxWidth="xl" component="main">
      {props.children}
    </Container>
  );
};

export { MainContainer };
