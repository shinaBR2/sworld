import { graphql } from '../../../graphql';
import type { LookPhotosQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPhotoFragment } from '../transformers';
import type { BaseQueryProps } from '../types';

const photosQuery = graphql(/* GraphQL */ `
  query LookPhotos @cached {
    photos(order_by: { takenAt: desc }) {
      ...PhotoFields
    }
  }
`);

// The flat, newest-first index the timeline reads. The UI groups it by month
// client-side from each photo's takenAt, so the hook stays a plain list.
const useLoadPhotos = (props: BaseQueryProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<LookPhotosQuery>({
    queryKey: ['look-photos'],
    getAccessToken,
    document: photosQuery,
  });

  return {
    photos: data ? data.photos.map(transformPhotoFragment) : [],
    isLoading,
    error,
  };
};

export { useLoadPhotos };
