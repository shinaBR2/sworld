import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Post } from '../types';
import { StyledCard, StyledDescription } from './Styled';
import { RequiredLinkComponent } from '../../../watch/videos/types';
import { genlinkProps } from './utils';

interface PostCardProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  post: Post;
}

export const PostCard = (props: PostCardProps) => {
  const { post, LinkComponent } = props;
  const { id, title, brief, readTimeInMinutes } = post;

  return (
    <LinkComponent {...genlinkProps(post)} style={{ textDecoration: 'none' }}>
      <StyledCard>
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
    </LinkComponent>
  );
};
