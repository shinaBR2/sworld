import Stack from '@mui/material/Stack';
import { CodeBlockWrapper } from './styled';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  const { children } = props;

  return (
    <Stack spacing={2} mt={4}>
      <CodeBlockWrapper>{children}</CodeBlockWrapper>
    </Stack>
  );
};

export { PostContent };
