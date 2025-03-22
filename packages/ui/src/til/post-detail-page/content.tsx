import { Card, CardContent } from '@mui/material';
import { CodeBlockWrapper } from './Styled';

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
