// https://shiki.style/guide/best-performance
import { codeToHtml } from 'shiki';
import parse from 'html-react-parser';
import React, { useState, useEffect } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [highlighted, setHighlighted] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Run highlighting effect only once when component mounts
  useEffect(() => {
    let isMounted = true;

    const highlight = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: 'material-theme',
        });

        // Only update state if component is still mounted
        if (isMounted) {
          setHighlighted(html);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error highlighting code:', err);

        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    highlight();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (isLoading) {
    return <div className="code-loading">Loading code...</div>;
  }

  if (error) {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }

  return <>{parse(highlighted)}</>;
};

export { CodeBlock };
