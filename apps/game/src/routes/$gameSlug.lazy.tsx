import { createLazyFileRoute } from '@tanstack/react-router';
import GameWrapper from '../core/GameWrapper';

export const Route = createLazyFileRoute('/$gameSlug')({
  component: GameWrapper,
});
