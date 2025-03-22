import React from 'react';
import Markdown from 'react-markdown';
import { codeToHtml } from 'shiki';
import parse from 'html-react-parser';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = (props: MarkdownContentProps) => {
  const { content } = props;
  const processedContent = content.replace(/\\n/g, '\n');

  return (
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
                    theme: 'material-theme',
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
  );
};

export { MarkdownContent };
