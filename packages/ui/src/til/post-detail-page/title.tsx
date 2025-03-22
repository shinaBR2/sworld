import { Card, CardContent, SxProps, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { MuiStyledProps } from '../../universal';

interface Props extends MuiStyledProps {
  title: string;
  readTimeInMinutes: number;
}

const PostMetadata = (props: Props) => {
  return (
    <Card sx={props.sx}>
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
