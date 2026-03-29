import { Container } from '@mui/material';

interface PostDetailPageContainerProps {
  children: React.ReactNode;
}

const PostDetailPageContainer = (props: PostDetailPageContainerProps) => {
  const { children } = props;

  return (
    <Container
      maxWidth="md"
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {children}
    </Container>
  );
};

export { PostDetailPageContainer };
