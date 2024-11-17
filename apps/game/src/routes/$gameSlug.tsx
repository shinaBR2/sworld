import { createFileRoute } from '@tanstack/react-router';
import { fetchGameFromSlug } from '../core/hooks/useLoadGame';

export const Route = createFileRoute('/$gameSlug')({
  loader: async ({ params }) => {
    return await fetchGameFromSlug(params.gameSlug);
  },
});
