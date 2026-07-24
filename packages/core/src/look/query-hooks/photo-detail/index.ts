import { graphql } from '../../../graphql';
import type { LookPhotoDetailQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPhotoFragment } from '../transformers';
import type { DetailQueryProps } from '../types';

const photoDetailQuery = graphql(/* GraphQL */ `
  query LookPhotoDetail($id: uuid!) @cached {
    photos_by_pk(id: $id) {
      ...PhotoFields
    }
  }
`);

const useLoadPhotoDetail = (props: DetailQueryProps) => {
  const { id, getAccessToken } = props;

  const { data, isLoading, error } = useRequest<
    LookPhotoDetailQuery,
    { id: string }
  >({
    queryKey: ['look-photo-detail', id],
    getAccessToken,
    document: photoDetailQuery,
    variables: {
      id,
    },
  });

  return {
    photo: data?.photos_by_pk
      ? transformPhotoFragment(data.photos_by_pk)
      : null,
    isLoading,
    error,
  };
};

export { useLoadPhotoDetail };
