import { createFileRoute } from '@tanstack/react-router';
import { useLoadPostDetail } from 'core/til/query-hooks/post-detail';
import React from 'react';
import Markdown from 'react-markdown';
import { PostContent, PostDetailPageContainer, PostMetadata } from 'ui/til/post-detail-page';
import { Layout } from '../components/layout';
import { codeToHtml } from 'shiki';
import parse from 'html-react-parser';

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
  const processedContent = mContent.replace(/\\n/g, '\n');

  return (
    <Layout>
      <PostDetailPageContainer>
        <PostMetadata title={title} readTimeInMinutes={readTimeInMinutes} />
        <PostContent>
          {/* <Markdown>{post.mContent.replace(/\\n/g, '\n')}</Markdown> */}

          <Markdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                if (!inline && match) {
                  const [, language] = match;
                  const code = String(children).replace(/\n$/, '');

                  // Using React's useState and useEffect for async operation
                  const [highlighted, setHighlighted] = React.useState('');

                  React.useEffect(() => {
                    const highlight = async () => {
                      try {
                        const html = await codeToHtml(code, {
                          lang: language,
                          theme: 'github-dark',
                        });
                        setHighlighted(html);
                      } catch (error) {
                        console.error('Error highlighting code:', error);
                        // Fallback to plain code
                        setHighlighted(`<pre><code>${code}</code></pre>`);
                      }
                    };

                    highlight();
                  }, [code, language]);

                  // Parse HTML to React elements instead of using dangerouslySetInnerHTML
                  return highlighted ? parse(highlighted) : null;
                }

                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {processedContent}
          </Markdown>
        </PostContent>
      </PostDetailPageContainer>
    </Layout>
  );
}
