import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { RequiredLinkComponent } from '../../../watch/videos/types';
import type { Post } from '../types';
import { ReadTimeBadge, StyledCard, StyledDescription } from './styled';
import { genlinkProps } from './utils';

interface PostCardProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  post: Post;
}

const PostCard = (props: PostCardProps) => {
  const { post, LinkComponent } = props;
  const { title, brief, readTimeInMinutes } = post;

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
          <Stack direction="row" spacing={1}>
            <ReadTimeBadge variant="caption">
              {readTimeInMinutes} min read
            </ReadTimeBadge>
          </Stack>
        </CardContent>
      </StyledCard>
    </LinkComponent>
  );
};

export { PostCard };
