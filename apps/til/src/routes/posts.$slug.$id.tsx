import { createFileRoute } from '@tanstack/react-router';
import { useLoadPostDetail } from 'core/til/query-hooks/post-detail';
import React from 'react';
import { PostContent, PostDetailPageContainer, PostMetadata } from 'ui/til/post-detail-page';
import { Layout } from '../components/layout';
import { MarkdownContent } from '../components/markdown';

export const Route = createFileRoute('/posts/$slug/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id: postId } = Route.useParams();
  const queryRs = useLoadPostDetail(postId);
  const { post, isLoading } = queryRs;
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!post) {
    return <div>Post not found</div>;
  }

  console.log('post', post);
  const { title, readTimeInMinutes, mContent } = post;

  return (
    <Layout sx={{ overflow: 'auto', pb: 6 }}>
      <PostDetailPageContainer>
        <PostMetadata title={title} readTimeInMinutes={readTimeInMinutes} sx={{ my: 3 }} />
        <PostContent>
          <MarkdownContent content={mContent} />
        </PostContent>
      </PostDetailPageContainer>
    </Layout>
  );
}
