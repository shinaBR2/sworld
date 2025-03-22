import React from 'react';

/**
 * TODO
 * Dynamic loading or using RSC in the future
 */
import Markdown from 'react-markdown';
import { CodeBlock } from './code-block';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = (props: MarkdownContentProps) => {
  const { content } = props;
  const processedContent = content
    .replace(/\\n/g, '\n')
    .replace(/!\[(.*?)\]\((.*?)( align=.*?)?\)/g, (_match, alt, url) => {
      return `![${alt}](${url})`;
    });
  console.log('MarkdownContent re-rendered processedContent');

  return (
    <Markdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          if (!inline && match) {
            const [, language] = match;
            const code = String(children).replace(/\n$/, '');

            return <CodeBlock code={code} language={language} />;
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
  );
};

export { MarkdownContent };
