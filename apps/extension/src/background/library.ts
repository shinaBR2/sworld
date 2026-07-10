import { getToken } from './auth';
import { hasuraConfig } from '../../envConfig';
import type { PdfMetadata } from 'core/universal/extension/communication/types';

const importBook = async (
  metadata: PdfMetadata,
): Promise<{ success: boolean; bookId?: string; error?: string }> => {
  const token = await getToken();
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const response = await fetch(hasuraConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation InsertBook($object: books_insert_input!) {
          insert_books_one(object: $object) {
            id
            title
          }
        }
      `,
      variables: {
        object: {
          title: metadata.title || 'Untitled',
          author: metadata.author || '',
          source: metadata.url,
          totalPages: metadata.pageCount,
          status: 'ready',
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    return {
      success: false,
      error: json.errors[0]?.message ?? 'Failed to insert book',
    };
  }

  const book = json.data?.insert_books_one;
  if (!book?.id) {
    return { success: false, error: 'No book ID returned' };
  }

  return { success: true, bookId: book.id };
};

export { importBook };
