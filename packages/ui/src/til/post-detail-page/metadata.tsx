import { Card, CardContent } from '@mui/material';
import Typography from '@mui/material/Typography';
import type { MuiStyledProps } from '../../universal';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
}

const PostMetadata = (props: Props) => {
  const { title, readTimeInMinutes, sx } = props;

  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Typography gutterBottom>{readTimeInMinutes} min read</Typography>
      </CardContent>
    </Card>
  );
};

export { PostMetadata };
