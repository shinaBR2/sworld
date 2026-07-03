import React, { useMemo } from 'react';

/**
 * TODO
 * Dynamic loading or using RSC in the future
 */
import Markdown from 'react-markdown';
import { MarkdownBlockquote } from 'ui/til/markdown';
import { CodeBlock } from './code-block';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = React.memo((props: MarkdownContentProps) => {
  const { content } = props;
  const processedContent = useMemo(() => {
    if (!content) return '';

    return content
      .replace(/\\n/g, '\n')
      .replace(
        /!\[(.*?)\]\((.*?)( align=(.*?))?\)/g,
        (_match, alt, url, _alignFull, alignValue) => {
          return alignValue
            ? `![${alt}](${url}#align=${alignValue})`
            : `![${alt}](${url})`;
        },
      );
  }, [content]);

  return (
    <Markdown
      components={{
        blockquote({ children }) {
          return <MarkdownBlockquote>{children}</MarkdownBlockquote>;
        },
        code({ node, className, children, ...props }) {
          // react-markdown v9 no longer passes `inline`; a `language-*` class
          // means a fenced code block, otherwise it's inline code.
          const match = /language-(\w+)/.exec(className || '');

          if (match) {
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
});

export { MarkdownContent };
