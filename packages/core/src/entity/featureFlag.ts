import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { useGetCollectionOn, useUpdateDoc } from '../universal/dbQuery';
import { PathConfigs } from '../universal/dbQuery/interfaces';
import { FeatureFlagItem } from './interfaces/featureFlag';

const reduceFunc = (ids: string[]) => {
  return ids.reduce((acc, id) => {
    return {
      ...acc,
      [id]: true,
    };
  }, {});
};

const featureFlagConverter: FirestoreDataConverter<FeatureFlagItem> = {
  toFirestore: data => {
    const { isGlobal, allowedUserIds: ids } = data;
    const allowedUserIds = !ids ? null : reduceFunc(ids as string[]);

    return {
      isGlobal,
      allowedUserIds,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
    const data = snapshot.data(options) as FeatureFlagItem;

    const { isGlobal, allowedUserIds } = data;
    const ids = Object.keys(allowedUserIds);

    return {
      id: snapshot.id,
      ...data,
      allowedUserIds: ids,
    };
  },
};

const useListenFeatureFlag = (db: Firestore, config: PathConfigs) => {
  const inputs = {
    db,
    ...config,
    converter: featureFlagConverter,
  };
  const { values, loading, error } = useGetCollectionOn(inputs);

  return {
    values,
    loading,
    error,
  };
};

const useSaveFeatureFlag = (db: Firestore, config: PathConfigs) => {
  const udpateFunc = useUpdateDoc();

  return async (id: string, inputs: FeatureFlagItem) => {
    const { path, pathSegments } = config;
    const updateInputs = {
      db,
      path,
      pathSegments: [...pathSegments, id],
      data: featureFlagConverter.toFirestore(inputs),
    };

    await udpateFunc(updateInputs);
  };
};

export { featureFlagConverter, useListenFeatureFlag, useSaveFeatureFlag };
