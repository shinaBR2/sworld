import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import request from 'graphql-request';
import { useQueryContext } from '../../../providers/query';
import { TypedDocumentString } from '../../../graphql/graphql';

interface UseMutationProps<TData, TVariables> {
  document: TypedDocumentString<TData, TVariables>;
  getAccessToken?: () => Promise<string>;
  options?: Omit<UseMutationOptions<TData, unknown, TVariables>, 'mutationFn'>;
}

const useMutationRequest = <TData = unknown, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  props: UseMutationProps<TData, TVariables>
) => {
  const { document, getAccessToken, options } = props;
  const { hasuraUrl } = useQueryContext();

  return useMutation<TData, unknown, TVariables>({
    ...options,
    mutationFn: async variables => {
      let headers: Record<string, string> = {
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
          document: document.toString(),
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
