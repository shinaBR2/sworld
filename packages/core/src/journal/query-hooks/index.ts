import { graphql } from '../../graphql';
import {
  GetJournalByIdQuery,
  GetJournalByIdQueryVariables,
  GetJournalsByMonthQuery,
  GetJournalsByMonthQueryVariables,
} from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';
import { JournalStatsCategory } from '../types';

const journalsByMonthQuery = graphql(/* GraphQL */ `
  query GetJournalsByMonth($startDate: date!, $endDate: date!) {
    journals(where: { date: { _gte: $startDate, _lte: $endDate } }, order_by: { date: desc, createdAt: desc }) {
      id
      user_id
      date
      content
      mood
      tags
      createdAt
      updatedAt
    }
    happy_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: "happy" } }) {
      aggregate {
        count
      }
    }
    neutral_aggregate: journals_aggregate(
      where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: "neutral" } }
    ) {
      aggregate {
        count
      }
    }
    sad_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: "sad" } }) {
      aggregate {
        count
      }
    }
    oldest_aggregate: journals(order_by: { date: asc }, limit: 1) {
      date
    }
  }
`);

const journalByIdQuery = graphql(/* GraphQL */ `
  query GetJournalById($id: uuid!) {
    journals_by_pk(id: $id) {
      id
      user_id
      date
      content
      mood
      tags
      createdAt
      updatedAt
    }
  }
`);

interface LoadJournalsByMonthProps {
  getAccessToken: () => Promise<string>;
  month: number;
  year: number;
}

interface LoadJournalByIdProps {
  getAccessToken: () => Promise<string>;
  id: string;
}

const getStartEndDates = (month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  return { startDate, endDate };
};

const transformJournalsByMonth = (data: any) => {
  const { journals = [], happy_aggregate, neutral_aggregate, sad_aggregate, oldest_aggregate } = data;

  const happyCount = happy_aggregate.aggregate?.count ?? 0;
  const neutralCount = neutral_aggregate.aggregate?.count ?? 0;
  const sadCount = sad_aggregate.aggregate?.count ?? 0;
  const totalCount = happyCount + neutralCount + sadCount;

  const categories: JournalStatsCategory[] = [
    { mood: 'happy', count: happyCount },
    { mood: 'neutral', count: neutralCount },
    { mood: 'sad', count: sadCount },
    { mood: 'total', count: totalCount },
  ];

  let oldestDate = oldest_aggregate[0]?.date || new Date().toISOString().split('T')[0];
  const [year, month] = oldestDate.split('-').map((n: string) => parseInt(n, 10));

  return {
    journals: journals,
    stats: {
      categories,
      oldest: {
        month,
        year,
      },
    },
  };
};

export const useLoadJournalsByMonth = (props: LoadJournalsByMonthProps) => {
  const { getAccessToken, month, year } = props;
  const { startDate, endDate } = getStartEndDates(month, year);

  const { data, isLoading, error } = useRequest<GetJournalsByMonthQuery, GetJournalsByMonthQueryVariables>({
    queryKey: ['journals', month, year],
    getAccessToken,
    document: journalsByMonthQuery,
    variables: {
      startDate,
      endDate,
    },
  });

  return {
    data: !isLoading && data ? transformJournalsByMonth(data) : null,
    isLoading,
    error,
  };
};

export const useLoadJournalById = (props: LoadJournalByIdProps) => {
  const { getAccessToken, id } = props;

  const { data, isLoading, error } = useRequest<GetJournalByIdQuery, GetJournalByIdQueryVariables>({
    queryKey: ['journal', id],
    getAccessToken,
    document: journalByIdQuery,
    variables: {
      id,
    },
  });

  return {
    data: !isLoading && data ? data.journals_by_pk : null,
    isLoading,
    error,
  };
};
