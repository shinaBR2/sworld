import { Card, CardContent } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

const PostContent = (props: Props) => {
  return (
    <Card>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
};

export { PostContent };
