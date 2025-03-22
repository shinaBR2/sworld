import { generatePostDetailRoute } from 'core/til/routes';
import { Post } from '../posts/type';

const genlinkProps = (post: Post) => {
  return generatePostDetailRoute({
    id: post.id,
    slug: post.slug,
  });
};

export { genlinkProps };
