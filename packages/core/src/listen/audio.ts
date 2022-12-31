import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import { AudioItem } from "../entity/interfaces";
import {
  useAddDoc,
  useDeleteDoc,
  useGetCollectionOn,
  useGetCollectionOnce,
  useUpdateDoc,
} from "../universal/dbQuery";
// import { AudioItem } from "./interfaces";

const path = "homeConfigs";
const basePathSegments = ["listen", "audios"];

/**
 * Some notes because of TS sucks
 * - `AudioItem` will be the result's type of `fromFirestore` function,
 * which used for frontend to display
 * - All field in the type of `data` of `toFirestore` MUST exist in `AudioItem`
 *
 * Problem:
 * - `AudioItem` contains `id` which can not be existed in `CreateAudioItemInputs`
 */
const converter: FirestoreDataConverter<AudioItem> = {
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

const useListenHomeAudioList = (db: Firestore) => {
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

const useGetHomeAudioList = (db: Firestore) => {
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

const useUploadHomeAudio = (db: Firestore) => {
  const addFunc = useAddDoc();

  return async (inputs: WithFieldValue<AudioItem>) => {
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

const useUpdateHomeAudioItem = (db: Firestore) => {
  const udpateFunc = useUpdateDoc();

  return async (inputs: WithFieldValue<AudioItem>) => {
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

const useDeleteHomeAudioItem = (db: Firestore) => {
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
  useListenHomeAudioList,
  useGetHomeAudioList,
  useUploadHomeAudio,
  useUpdateHomeAudioItem,
  useDeleteHomeAudioItem,
};
