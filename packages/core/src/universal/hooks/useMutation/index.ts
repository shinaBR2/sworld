import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import type { TypedDocumentString } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useQueryContext } from '../../../providers/query';

interface UseMutationProps<TData, TError, TVariables> {
  document: TypedDocumentString<TData, TVariables>;
  getAccessToken?: () => Promise<string>;
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>;
}

const useMutationRequest = <
  TData = unknown,
  TError = unknown,
  TVariables extends object = {},
>(
  props: UseMutationProps<TData, TError, TVariables>,
) => {
  const { document, getAccessToken, options } = props;
  const { hasuraUrl } = useQueryContext();
  const { isSignedIn, signOut } = useAuthContext();

  return useMutation<TData, TError, TVariables>({
    ...options,
    mutationFn: async (variables) => {
      let headers: Record<string, string> = {
        'content-type': 'application/json',
      };

      /**
       * getAccessToken is undefined for "anonymous" role
       */
      if (typeof getAccessToken !== 'undefined') {
        /**
         * If user is not signed in, signOut and throw error
         */
        if (!isSignedIn) {
          signOut();
          throw new Error('Session expired. Please sign in again.');
        }

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
