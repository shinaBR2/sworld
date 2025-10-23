import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import type { TypedDocumentString } from '../../graphql/graphql';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { isTokenExpired } from '../graphql/errors';

interface UseRequestProps<TData, TVariables> {
  queryKey: unknown[];
  document: TypedDocumentString<TData, TVariables>;
  variables?: TVariables;
  getAccessToken?: () => Promise<string>;
  staleTime?: number;
  enabled?: boolean;
}

const useRequest = <TData = unknown, TVariables extends object = {}>(
  props: UseRequestProps<TData, TVariables>,
) => {
  const {
    queryKey,
    getAccessToken,
    document,
    variables,
    staleTime = 5 * 60 * 1000,
    enabled = true,
  } = props;
  const { isSignedIn, signOut } = useAuthContext();
  const { hasuraUrl } = useQueryContext();

  return useQuery<TData, Error>({
    queryKey,
    queryFn: async (): Promise<TData> => {
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
        return await request({
          url: hasuraUrl,
          document: document.toString(),
          requestHeaders: headers,
          variables,
        });
      } catch (error) {
        if (isTokenExpired(error)) {
          signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        throw error;
      }
    },
    staleTime,
    enabled,
  });
};

export { useRequest };
