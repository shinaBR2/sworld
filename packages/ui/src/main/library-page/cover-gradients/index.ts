// Single source for book-cover gradients. These decorative brand gradients are
// deterministic per book (like an avatar colour) and intentionally identical in
// light and dark mode, so they live in one shared ui module rather than being
// duplicated across the card component and the library route.

const BOOK_COVER_GRADIENTS = [
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

// Deterministic pick so a given book always shows the same cover gradient.
const getCoverGradient = (bookId: string): string => {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    const char = bookId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % BOOK_COVER_GRADIENTS.length;
  return BOOK_COVER_GRADIENTS[index];
};

export { BOOK_COVER_GRADIENTS, getCoverGradient };
