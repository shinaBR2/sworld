import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { Feeling } from '../entity/interfaces';
import {
  useAddDoc,
  useDeleteDoc,
  useGetCollectionOn,
  useGetCollectionOnce,
  useUpdateDoc,
} from '../universal/dbQuery';

const path = 'homeConfigs';
const basePathSegments = ['listen', 'feelings'];

const converter: FirestoreDataConverter<Feeling> = {
  toFirestore: (data: WithFieldValue<Feeling>) => {
    const { name, value } = data;

    return {
      name,
      value,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      name: data.name,
      value: data.value,
      creatorId: data.creatorId,
      createdAt: data.createdAt,
      editorId: data.editorId,
      updatedAt: data.updatedAt,
    };
  },
};

const useListenHomeFeelingList = (db: Firestore) => {
  const inputs = {
    db,
    path,
    pathSegments: [...basePathSegments],
    converter,
  };
  const { values, loading, error } = useGetCollectionOn(inputs);

  return {
    values,
    loading,
    error,
  };
};

const useGetHomeFeelingList = (db: Firestore) => {
  const inputs = {
    db,
    path,
    pathSegments: [...basePathSegments],
    converter,
  };
  const { values, loading, error } = useGetCollectionOnce(inputs);

  return {
    values,
    loading,
    error,
  };
};

const useAddHomeFeeling = (db: Firestore) => {
  const addFunc = useAddDoc();

  return async (inputs: WithFieldValue<Feeling>) => {
    const addInputs = {
      db,
      path,
      pathSegments: [...basePathSegments],
      data: converter.toFirestore(inputs),
    };

    const id = await addFunc(addInputs);

    return id;
  };
};

const useUpdateHomeFeeling = (db: Firestore) => {
  const udpateFunc = useUpdateDoc();

  return async (inputs: WithFieldValue<Feeling>) => {
    const { id } = inputs;
    const updateInputs = {
      db,
      path,
      pathSegments: [...basePathSegments, id.toString()],
      data: converter.toFirestore(inputs),
    };

    await udpateFunc(updateInputs);
  };
};

const useDeleteHomeFeeling = (db: Firestore) => {
  const deleteFunc = useDeleteDoc();

  return async (id: string) => {
    const deleteInputs = {
      db,
      path,
      pathSegments: [...basePathSegments, id],
    };

    await deleteFunc(deleteInputs);
  };
};

export {
  useListenHomeFeelingList,
  useGetHomeFeelingList,
  useAddHomeFeeling,
  useUpdateHomeFeeling,
  useDeleteHomeFeeling,
};
