import { useLoadPosts } from 'core/til/query-hooks/posts';

type Post = ReturnType<typeof useLoadPosts>['posts'][number];

export { type Post };
