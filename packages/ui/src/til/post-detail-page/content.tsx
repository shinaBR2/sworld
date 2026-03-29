import { CardContent } from '@mui/material';
import { CodeBlockWrapper } from './styled';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  return (
    <CardContent>
      <CodeBlockWrapper>{props.children}</CodeBlockWrapper>
    </CardContent>
  );
};

export { PostContent };
