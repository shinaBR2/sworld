import { Card, CardContent } from '@mui/material';
import Typography from '@mui/material/Typography';

interface Props {
  title: string;
  readTimeInMinutes: number;
}

const PostMetadata = (props: Props) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {props.title}
        </Typography>
        <Typography gutterBottom>{props.readTimeInMinutes} min read</Typography>
      </CardContent>
    </Card>
  );
};

export { PostMetadata };
