import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useQueryContext } from '../../providers/query';
import { TypedDocumentString } from '../../graphql/graphql';

interface UseRequestProps<TData, TVariables> {
  queryKey: unknown[];
  document: TypedDocumentString<TData, TVariables>;
  variables?: TVariables;
  getAccessToken?: () => Promise<string>;
  staleTime?: number;
}

const useRequest = <TData = unknown, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  props: UseRequestProps<TData, TVariables>
) => {
  const { queryKey, getAccessToken, document, variables, staleTime = 5 * 60 * 1000 } = props;

  const { hasuraUrl } = useQueryContext();

  return useQuery<TData>({
    queryKey,
    queryFn: async () => {
      let headers: Record<string, string> = {
        'content-type': 'application/json',
      };

      if (typeof getAccessToken !== 'undefined') {
        try {
          const token = await getAccessToken();

          if (!token) {
            throw new Error('Invalid access token');
          }

          headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
          };
        } catch (error) {
          console.error('Authentication failed:', error);
          throw error;
        }
      }

      try {
        return request({
          url: hasuraUrl,
          document: document.toString(),
          requestHeaders: headers,
          variables,
        });
      } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
      }
    },
    staleTime,
  });
};

export { useRequest };
