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

export const PostCard = (props: PostCardProps) => {
  const { post, LinkComponent } = props;
  const { title, brief, readTimeInMinutes, createdAt } = post;

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
          <Stack direction="row" spacing={2} alignItems="center">
            <ReadTimeBadge variant="caption">
              {readTimeInMinutes} min read
            </ReadTimeBadge>
            {createdAt && (
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(createdAt)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </StyledCard>
    </LinkComponent>
  );
};
