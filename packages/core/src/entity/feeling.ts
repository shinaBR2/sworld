import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import {
  useAddDoc,
  useDeleteDoc,
  useGetCollectionOn,
  useUpdateDoc,
} from "../universal/dbQuery";
import { BaseFirestoreInputs } from "../universal/dbQuery/interfaces";
import { Feeling } from "./interfaces";

const basePath = "/feelings";
const basePathSegments: string[] = [""];

const converter: FirestoreDataConverter<Feeling> = {
  toFirestore: (data: WithFieldValue<Feeling>) => {
    /**
     * Should I validate the data here?
     */
    return {
      ...data,
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

type PathConfigs = Omit<BaseFirestoreInputs, "db">;

const useListenEntityList = (db: Firestore, config?: PathConfigs) => {
  const inputs = {
    db,
    path: basePath,
    pathSegments: [...basePathSegments],
    converter,
    ...config,
  };
  const { values, loading, error } = useGetCollectionOn(inputs);

  return {
    values,
    loading,
    error,
  };
};

/**
 * TODO
 * Use batched-write
 */
const useAddEntity = (db: Firestore) => {
  const addFunc = useAddDoc();

  return async (inputs: WithFieldValue<Feeling>) => {
    const addInputs = {
      db,
      path: basePath,
      pathSegments: [...basePathSegments],
      data: converter.toFirestore(inputs),
    };

    const id = await addFunc(addInputs);

    return id;
  };
};

/**
 * TODO
 * Use batched-write/transaction
 */
const useUpdateEntity = (db: Firestore) => {
  const udpateFunc = useUpdateDoc();

  return async (inputs: WithFieldValue<Feeling>) => {
    const { id } = inputs;
    const updateInputs = {
      db,
      path: basePath,
      pathSegments: [...basePathSegments, id.toString()],
      data: converter.toFirestore(inputs),
    };

    await udpateFunc(updateInputs);
  };
};

const useDeleteEntity = (db: Firestore) => {
  const deleteFunc = useDeleteDoc();

  return async (id: string) => {
    const deleteInputs = {
      db,
      path: basePath,
      pathSegments: [...basePathSegments, id.toString()],
    };

    await deleteFunc(deleteInputs);
  };
};

export { useListenEntityList, useAddEntity, useUpdateEntity, useDeleteEntity };
