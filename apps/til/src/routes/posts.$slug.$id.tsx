import { createFileRoute } from '@tanstack/react-router';
import { useLoadPostDetail } from 'core/til/query-hooks/post-detail';
import React from 'react';
import {
  PostContent,
  PostDetailPageContainer,
  PostMetadata,
  SkeletonPostContent,
  SkeletonPostMetadata,
} from 'ui/til/post-detail-page';
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
    return (
      <Layout sx={{ overflow: 'auto', pb: 6 }}>
        <PostDetailPageContainer>
          <SkeletonPostMetadata sx={{ my: 3 }} />
          <SkeletonPostContent />
        </PostDetailPageContainer>
      </Layout>
    );
  }
  if (!post) {
    return (
      <Layout sx={{ overflow: 'auto', pb: 6 }}>
        <PostDetailPageContainer>
          <h2>Post Not Found</h2>
          <p>The post you're looking for is unavailable or has been removed.</p>
        </PostDetailPageContainer>
      </Layout>
    );
  }

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
