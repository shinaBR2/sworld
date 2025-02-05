import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import request, { type Variables } from 'graphql-request';
import { useQueryContext } from '../../../providers/query';

interface UseMutationProps<TData, TVariables> {
  document: string;
  getAccessToken?: () => Promise<string>;
  options?: Omit<UseMutationOptions<TData, unknown, TVariables>, 'mutationFn'>;
}

interface Headers extends Record<string, string | undefined> {
  'content-type': string;
  Authorization?: string;
}

const useMutationRequest = <TData = unknown, TVariables extends object | undefined = Variables>(
  props: UseMutationProps<TData, TVariables>
) => {
  const { document, getAccessToken, options } = props;
  const { hasuraUrl } = useQueryContext();

  return useMutation<TData, unknown, TVariables>({
    ...options,
    mutationFn: async variables => {
      let headers: Headers = {
        'content-type': 'application/json',
      };

      if (typeof getAccessToken !== 'undefined') {
        let token: string;
        try {
          token = await getAccessToken();
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
        return request<TData>({
          url: hasuraUrl,
          document,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          requestHeaders: headers,
          variables,
        });
      } catch (error) {
        console.error('GraphQL mutation failed:', error);
        throw error;
      }
    },
  });
};

export { useMutationRequest };
