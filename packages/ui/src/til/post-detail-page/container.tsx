import { Container } from '@mui/material';

interface PostDetailPageContainerProps {
  children: React.ReactNode;
}

const PostDetailPageContainer = (props: PostDetailPageContainerProps) => {
  return <Container maxWidth="md">{props.children}</Container>;
};

export { PostDetailPageContainer };
