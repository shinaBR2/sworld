import PushPinIcon from '@mui/icons-material/PushPin';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatDateTime } from 'core/universal/common';
import type { RequiredLinkComponent } from '../../../watch/videos/types';
import type { Post } from '../types';
import { ReadTimeBadge, StyledCard, StyledDescription } from './styled';
import { genlinkProps } from './utils';

interface PostCardProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  post: Post;
}

export const PostCard = (props: PostCardProps) => {
  const { post, LinkComponent } = props;
  const { title, brief, readTimeInMinutes, createdAt, pinned } = post;

  return (
    <LinkComponent {...genlinkProps(post)} style={{ textDecoration: 'none' }}>
      <StyledCard>
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {pinned && (
              <PushPinIcon
                fontSize="small"
                color="action"
                aria-label="Pinned"
              />
            )}
          </Stack>
          <StyledDescription variant="body2" color="text.secondary">
            {brief}
          </StyledDescription>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <ReadTimeBadge variant="caption">
              {readTimeInMinutes} min read
            </ReadTimeBadge>
            {createdAt && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {formatDateTime(createdAt)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </StyledCard>
    </LinkComponent>
  );
};
