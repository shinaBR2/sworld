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
import { AudioItem } from "./interfaces";

const basePath = "/audios";
const basePathSegments: string[] = [""];

type PathConfigs = Omit<BaseFirestoreInputs, "db">;

const audioConverter: FirestoreDataConverter<AudioItem> = {
  toFirestore: (data: WithFieldValue<AudioItem>) => {
    const { image, ...rest } = data;

    return {
      ...rest,
      thumbnailUrl: image,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      src: data.src,
      name: data.name,
      artistName: data.artistName,
      image: data.thumbnailUrl,
      uploaderId: data.uploaderId,
      editorId: data.editorId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

const useListenEntityList = (db: Firestore, config?: PathConfigs) => {
  const inputs = {
    db,
    path: basePath,
    pathSegments: [...basePathSegments],
    converter: audioConverter,
    ...config,
  };
  const { values, loading, error } = useGetCollectionOn(inputs);

  return {
    values,
    loading,
    error,
  };
};

const useAddEntity = (db: Firestore) => {
  const addFunc = useAddDoc();

  return async (inputs: WithFieldValue<AudioItem>) => {
    const addInputs = {
      db,
      path: basePath,
      pathSegments: [...basePathSegments],
      data: audioConverter.toFirestore(inputs),
    };

    const id = await addFunc(addInputs);

    return id;
  };
};

const useUpdateEntity = (db: Firestore) => {
  const udpateFunc = useUpdateDoc();

  return async (inputs: WithFieldValue<AudioItem>) => {
    const { id } = inputs;
    const updateInputs = {
      db,
      path: basePath,
      pathSegments: [...basePathSegments, id.toString()],
      data: audioConverter.toFirestore(inputs),
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

export {
  audioConverter,
  useListenEntityList,
  useAddEntity,
  useUpdateEntity,
  useDeleteEntity,
};
