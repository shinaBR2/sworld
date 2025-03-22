import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Post } from '../type';
import { StyledCard, StyledDescription } from './Styled';

interface PostCardProps {
  post: Post;
}

export const PostCard = (props: PostCardProps) => {
  const { post } = props;
  const { id, title, brief, readTimeInMinutes } = post;

  return (
    <StyledCard key={id}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <StyledDescription variant="body2" color="text.secondary">
          {brief}
        </StyledDescription>
        <Typography variant="caption" color="text.disabled">
          {readTimeInMinutes} min read
        </Typography>
      </CardContent>
    </StyledCard>
  );
};
