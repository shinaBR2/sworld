import { Card, CardContent } from '@mui/material';
import { CodeBlockWrapper } from './styled';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  return (
    <Card>
      <CardContent>
        <CodeBlockWrapper>{props.children}</CodeBlockWrapper>
      </CardContent>
    </Card>
  );
};

export { PostContent };
