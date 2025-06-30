import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';

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
  const [filter, setFilter] = useState<'all' | 'completed' | 'reading' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch data using our hooks
  const {
    data: books = [],
    isLoading: booksLoading,
    error: booksError,
  } = useBooks({
    filter,
    limit: 24,
    offset: page * 24,
  });

  const { data: stats, isLoading: statsLoading } = useReadingStats();
  const { data: currentBook, isLoading: currentBookLoading } = useCurrentReading();
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

  const handleAddBook = () => {
    // TODO: Open add book dialog or navigate to add book page
    console.log('Add book clicked');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Search:', query);
  };

  const handleBookClick = (book: BookWithProgress) => {
    // Navigate to book reader
    navigate({
      to: '/reader/$bookId',
      params: { bookId: book.id },
    });
  };

  const handleContinueReading = (book: CurrentBook) => {
    // Navigate to continue reading
    navigate({
      to: '/reader/$bookId',
      params: { bookId: book.id },
    });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as typeof filter);
    setPage(0); // Reset page when filter changes
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
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
  const transformedBooks = books.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author || 'Unknown Author',
    progress: book.isCompleted ? undefined : book.progressPercentage,
    isCompleted: book.isCompleted,
    isNew: book.isNew,
    coverGradient: getCoverGradient(book.id), // Generate consistent gradient based on ID
  }));

  // Default stats if still loading
  const displayStats = stats || {
    completed: 0,
    currentlyReading: 0,
    readingTimeThisMonth: 0,
    wishlist: 0,
  };

  // Show loading state
  if (booksLoading && page === 0) {
    return (
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (booksError) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 4 }}>
        <Alert severity="error">Failed to load your library. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <ReadHeader
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onAddBook={handleAddBook}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4, pb: isMobile ? 10 : 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            component="h2"
            sx={{
              fontSize: '1.875rem',
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
              m: 0,
            }}
          >
            Welcome back, John!
          </Box>
          <Box component="p" sx={{ color: 'text.secondary', m: 0 }}>
            Continue your reading journey or discover something new.
          </Box>
        </Box>

        {/* Continue Reading */}
        {!currentBookLoading && transformedCurrentBook && (
          <ContinueReading book={transformedCurrentBook} onBookClick={handleContinueReading} />
        )}

        {/* Stats Grid */}
        <StatsGrid stats={displayStats} />

        {/* Books Grid */}
        <BooksGrid
          books={transformedBooks}
          filter={filter}
          onFilterChange={handleFilterChange}
          onBookClick={handleBookClick}
          onLoadMore={handleLoadMore}
          hasMore={books.length === 24} // Assume more if we got a full page
          loading={booksLoading}
        />
      </Container>

      {/* Mobile Navigation */}
      <MobileNavigation value={currentTab} onChange={handleTabChange} />
    </Box>
  );
};

export const Route = createLazyFileRoute('/library')({
  component: () => {
    return (
      <AuthRoute>
        <LibraryPage />
      </AuthRoute>
    );
  },
});
