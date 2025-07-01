import { createLazyFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Box } from 'ui/universal/containers/generic';
import { ReadingHeader } from 'ui/main/library-page/reading-header';
import { ReadingNav } from 'ui/main/library-page/reading-nav';

interface BookReaderPageProps {
  bookTitle?: string;
  author?: string;
  totalPages?: number;
  initialPage?: number;
}

const BookReaderPage: React.FC<BookReaderPageProps> = ({
  bookTitle = 'What life should mean to you',
  author = 'Alfred Adler',
  totalPages = 240,
  initialPage = 156,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(Math.round((initialPage / totalPages) * 100));

  // Sample book content for demonstration
  const bookContent = {
    [currentPage]: {
      title: 'Chapter 12: The Meaning of Life',
      content: `The question of what life should mean to you is not one that can be answered simply or universally. Each individual must discover their own unique purpose and meaning through their experiences, relationships, and contributions to society.

In my years of studying human psychology, I have observed that those who find the deepest satisfaction in life are those who understand that meaning comes not from what we take from life, but from what we give to it. The individual who seeks only personal pleasure and advantage will find themselves empty and unfulfilled.

True meaning emerges when we recognize our fundamental interconnectedness with others. No human being exists in isolation. We are social creatures, born into communities, dependent on others for our very survival and growth. This social nature is not a limitation but our greatest strength.

When we embrace our role as contributors to the common good, when we see ourselves as part of something larger than our individual desires, we begin to experience what I call "social interest." This social interest is the foundation of mental health and personal fulfillment.

Consider the parent who sacrifices for their child, the teacher who dedicates themselves to education, the artist who creates beauty for others to enjoy. These individuals have found meaning because they have connected their personal existence to something beyond themselves.

But this does not mean we must lose our individuality. Rather, we express our unique gifts in service of the whole. The musician contributes through music, the healer through medicine, the builder through construction. Each person has their own way of participating in the human community.

The search for meaning is ultimately a search for our place in this larger human story. When we find that place and embrace it fully, we discover that life has profound significance. We are not merely existing; we are participating in the ongoing creation of human civilization and culture.`,
    },
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setReadingProgress(Math.round((page / totalPages) * 100));
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const handleClickArea = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
    }
  };

  return (
    <FullPageContainer
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        fontFamily: 'Georgia, serif',
        position: 'relative',
      }}
    >
      {/* Click area to toggle menu */}
      <Box
        onClick={handleClickArea}
        sx={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          bottom: '80px',
          cursor: 'pointer',
          zIndex: 1,
        }}
      />

      {/* Header AppBar */}
      <ReadingHeader
        isMenuOpen={isMenuOpen}
        isSettingsOpen={isSettingsOpen}
        toggleSettingsOpen={() => setIsSettingsOpen(!isSettingsOpen)}
        bookTitle={bookTitle}
        author={author}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={goToPage}
      />

      {/* Book Content */}
      {/* <Box
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          pt: '80px',
          pb: '80px',
          px: 3,
          lineHeight: 1.8,
          fontSize: `${fontSize}px`,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: `${fontSize + 6}px`,
            fontWeight: 700,
            mb: 4,
            textAlign: 'center',
            lineHeight: 1.3,
            fontFamily: 'Georgia, serif',
          }}
        >
          {bookContent[currentPage]?.title}
        </Typography>

        {bookContent[currentPage]?.content.split('\n\n').map((paragraph, index) => (
          <Typography
            key={index}
            component="p"
            sx={{
              mb: 3,
              textAlign: 'justify',
              textIndent: '2em',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              fontFamily: 'Georgia, serif',
            }}
          >
            {paragraph}
          </Typography>
        ))}
      </Box> */}

      {/* Footer Navigation */}
      <ReadingNav
        isMenuOpen={isMenuOpen}
        currentPage={currentPage}
        totalPages={totalPages}
        readingProgress={readingProgress}
        prevPage={prevPage}
        nextPage={nextPage}
      />
      {/* <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
          opacity: isMenuOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            startIcon={<PrevIcon />}
            variant="contained"
            onClick={prevPage}
            disabled={currentPage <= 1}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Previous
          </Button>

          <Box sx={{ flex: 1, mx: 3 }}>
            <LinearProgress
              variant="determinate"
              value={readingProgress}
              sx={{
                height: 4,
                borderRadius: 1,
                mb: 1,
                bgcolor: 'divider',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              Page {currentPage} of {totalPages} • {readingProgress}% complete
            </Typography>
          </Box>

          <Button
            endIcon={<NextIcon />}
            variant="contained"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Next
          </Button>
        </Box>
      </Paper> */}
    </FullPageContainer>
  );
};

export const Route = createLazyFileRoute('/library/books/$bookId')({
  component: BookReaderPage,
});
