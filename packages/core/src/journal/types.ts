import { useLoadJournalById } from './query-hooks';

type MoodType = 'happy' | 'neutral' | 'sad';

type Journal = ReturnType<typeof useLoadJournalById>['data'];

interface JournalStatsCategory {
  mood: MoodType | 'total';
  count: number;
}

interface JournalStats {
  categories: JournalStatsCategory[];
  oldest: {
    month: number;
    year: number;
  };
}

export { type Journal, type JournalStats, type JournalStatsCategory, type MoodType };
