import { useQuery } from '@tanstack/react-query';
import request, { Variables } from 'graphql-request';
import { useQueryContext } from '../../providers/query';

interface UseRequestProps {
  queryKey: unknown[];
  getAccessToken: () => Promise<string>;
  document: string;
  variables?: Variables;
}

const useRequest = <TData = unknown>(props: UseRequestProps) => {
  const { queryKey, getAccessToken, document, variables } = props;

  const { hasuraUrl } = useQueryContext();
  const rs = useQuery<TData>({
    queryKey,
    queryFn: async () => {
      let token: string;
      try {
        token = await getAccessToken();

        if (!token) {
          throw new Error('Invalid access token');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        throw error;
      }

      try {
        return request<TData>({
          url: hasuraUrl,
          document,
          requestHeaders: {
            Authorization: `Bearer ${token}`,
          },
          variables,
        });
      } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
      }
    },
  });

  return rs;
};

export { useRequest };
