import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
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
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.125rem',
              lineHeight: 1.4,
              mb: 1.5,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          <StyledDescription variant="body2" color="text.secondary">
            {brief}
          </StyledDescription>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <ReadTimeBadge variant="caption">
              {readTimeInMinutes} min read
            </ReadTimeBadge>
          </Box>
        </CardContent>
      </StyledCard>
    </LinkComponent>
  );
};

export { PostCard };
