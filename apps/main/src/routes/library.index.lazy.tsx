import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import {
  useBooks,
  useCurrentReading,
  useReadingStats,
} from 'core/library/query-hooks';
import type React from 'react';
import { useState } from 'react';
import { BooksGrid } from 'ui/main/library-page/home-books-grid';
import { ContinueReading } from 'ui/main/library-page/home-continue-reading';
import { StatsGrid } from 'ui/main/library-page/home-stats';
import { Welcome } from 'ui/main/library-page/home-welcome';
import { MobileNavigation } from 'ui/main/library-page/mobile-nav';
import { FullWidthContainer } from 'ui/universal';
import { AuthRoute } from 'ui/universal/authRoute';
import { Container } from 'ui/universal/containers/generic';
import { useIsMobile } from 'ui/universal/responsive';
import { Layout } from '../components/layout';

// Helper function to generate consistent gradients based on book ID
const gradients = [
  'linear-gradient(135deg, #ef4444, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #6b7280, #374151)',
  'linear-gradient(135deg, #14b8a6, #0891b2)',
  'linear-gradient(135deg, #f97316, #dc2626)',
  'linear-gradient(135deg, #a855f7, #e11d48)',
  'linear-gradient(135deg, #059669, #7c3aed)',
];

const getCoverGradient = (bookId: string): string => {
  // Create a simple hash from the book ID to ensure consistent colors
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    const char = bookId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const LibraryPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [filter, setFilter] = useState<
    'all' | 'completed' | 'reading' | 'recent'
  >('all');
  // const [searchQuery, setSearchQuery] = useState('');
  // const [page, setPage] = useState(0);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch data using our hooks
  const { data: books = [], isLoading: booksLoading } = useBooks();

  const { data: stats, isLoading: statsLoading } = useReadingStats();
  const { data: currentBook, isLoading: currentBookLoading } =
    useCurrentReading();
  // const updateProgress = useUpdateReadingProgress();

  const handleTabChange = (value: number) => {
    setCurrentTab(value);
    // Handle navigation based on tab
    switch (value) {
      case 0:
        // Already on library
        break;
      case 1:
        // Navigate to currently reading
        setFilter('reading');
        break;
      case 2:
        // Navigate to wishlist
        console.log('Navigate to wishlist');
        break;
      case 3:
        // Navigate to statistics
        console.log('Navigate to statistics');
        break;
    }
  };

  // const handleAddBook = () => {
  //   // TODO: Open add book dialog or navigate to add book page
  //   console.log('Add book clicked');
  // };

  // const handleSearch = (query: string) => {
  //   setSearchQuery(query);
  //   // TODO: Implement search functionality
  //   console.log('Search:', query);
  // };

  const handleBookClick = (book: BookWithProgress) => {
    // Navigate to book reader
    navigate({
      to: '/library/books/$bookId',
      params: { bookId: book.id },
    });
  };

  const handleContinueReading = (book: CurrentBook) => {
    // Navigate to continue reading
    navigate({
      to: '/library/books/$bookId',
      params: { bookId: book.id },
    });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as typeof filter);
    // setPage(0); // Reset page when filter changes
  };

  const handleLoadMore = () => {
    // setPage(prev => prev + 1);
    // TODO: Implement load more functionality
  };

  // Transform current book data for the component
  const transformedCurrentBook = currentBook
    ? {
        id: currentBook.id,
        title: currentBook.title,
        author: currentBook.author,
        currentPage: currentBook.currentPage,
        totalPages: currentBook.totalPages,
        lastReadAt: currentBook.lastReadAt,
      }
    : undefined;

  // Transform books data for the component
  const transformedBooks = books?.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author || 'Unknown Author',
    progress: book.isCompleted ? undefined : book.progressPercentage,
    isCompleted: book.isCompleted,
    isNew: book.isNew,
    coverGradient: getCoverGradient(book.id), // Generate consistent gradient based on ID
    thumbnailUrl: book.thumbnailUrl,
  }));

  // Show error state
  // if (booksError) {
  //   return (
  //     <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 4 }}>
  //       <Alert severity="error">Failed to load your library. Please try again later.</Alert>
  //     </Box>
  //   );
  // }

  return (
    <Layout>
      <FullWidthContainer>
        {/* Header */}
        {/* <ReadHeader
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onAddBook={handleAddBook}
        onSearch={handleSearch}
      /> */}

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4, pb: isMobile ? 10 : 4 }}>
          {/* Welcome Section */}
          <Welcome />

          {/* Continue Reading */}
          <ContinueReading
            isLoading={currentBookLoading}
            book={transformedCurrentBook}
            onBookClick={handleContinueReading}
          />

          {/* Stats Grid */}
          <StatsGrid isLoading={statsLoading} stats={stats} />

          {/* Books Grid */}
          <BooksGrid
            books={transformedBooks}
            filter={filter}
            onFilterChange={handleFilterChange}
            onBookClick={handleBookClick}
            onLoadMore={handleLoadMore}
            hasMore={books?.length === 24} // Assume more if we got a full page
            isLoading={booksLoading}
          />
        </Container>

        {/* Mobile Navigation */}
        <MobileNavigation value={currentTab} onChange={handleTabChange} />
      </FullWidthContainer>
    </Layout>
  );
};

export const Route = createLazyFileRoute('/library/')({
  component: () => {
    return (
      <AuthRoute>
        <LibraryPage />
      </AuthRoute>
    );
  },
});
