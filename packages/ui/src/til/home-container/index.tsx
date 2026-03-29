import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { useLoadPosts } from 'core/til/query-hooks/posts';
import type { RequiredLinkComponent } from '../../watch/videos/types';
import { PostCard } from '../posts/post-card';
import { SkeletonPostCard } from '../posts/post-card/skeleton';
import { texts } from './texts';

const Loading = () => {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={3}>
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <Stack
            key={`skeleton-${i}`}
            sx={{
              width: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(33.333% - 16px)',
              },
            }}
          >
            <SkeletonPostCard />
          </Stack>
        ))}
    </Stack>
  );
};

interface HomeContainerProps extends Omit<RequiredLinkComponent, 'linkProps'> {
  queryRs: ReturnType<typeof useLoadPosts>;
}

const HomeContainer = (props: HomeContainerProps) => {
  const { queryRs } = props;
  const { posts, isLoading } = queryRs;

  return (
    <Container
      maxWidth="lg"
      sx={{
        flex: 1,
        height: 0,
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        overflow: 'auto',
      }}
    >
      {isLoading ? (
        <Loading />
      ) : posts.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" spacing={3}>
          {posts.map((p) => (
            <Stack
              key={p.id}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 12px)',
                  md: 'calc(33.333% - 16px)',
                },
              }}
            >
              <PostCard post={p} LinkComponent={Link} />
            </Stack>
          ))}
        </Stack>
      ) : (
        texts.noPosts
      )}
    </Container>
  );
};

export { HomeContainer };
