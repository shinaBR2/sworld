import { createLazyFileRoute } from '@tanstack/react-router';
import React from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { ReadingContent } from 'ui/main/library-page/reading-content';
import { useBookById } from 'core/library/query-hooks';
import { Layout } from '../components/layout';
import { AuthRoute } from 'ui/universal/authRoute';

interface BookReaderPageProps {
  bookTitle?: string;
  author?: string;
  totalPages?: number;
  initialPage?: number;
}

const BookReaderPage: React.FC<BookReaderPageProps> = () => {
  const { bookId } = Route.useParams();
  const { data, isLoading, error } = useBookById(bookId);

  return (
    <Layout>
      <FullPageContainer
        sx={{
          minHeight: 'calc(100vh - 70px)',
          bgcolor: 'background.default',
          color: 'text.primary',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        <ReadingContent
          isLoading={isLoading}
          error={error?.message}
          pdfUrl={data?.books_by_pk?.source || ''}
          onErrorClick={() => {
            window.location.reload();
          }}
        />
      </FullPageContainer>
    </Layout>
  );
};

export const Route = createLazyFileRoute('/library/books/$bookId')({
  component: () => {
    return (
      <AuthRoute>
        <BookReaderPage />
      </AuthRoute>
    );
  },
});
