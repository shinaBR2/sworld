import {
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import { useAddDoc, useGetCollectionOnce } from "../universal/dbQuery";
import {
  AudioItem,
  AudioItemInputs,
  CreateAudioItemInputs,
  UpdateAudioItemInputs,
} from "./interfaces";

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
  toFirestore: (data: CreateAudioItemInputs) => {
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

const useGetHomeAudioList = (db: Firestore) => {
  const inputs = {
    db,
    path: "homeConfigs",
    pathSegments: ["listen", "audioList"],
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

  return async (inputs: CreateAudioItemInputs) => {
    const addInputs = {
      db,
      path: "homeConfigs",
      pathSegments: ["listen", "audioList"],
      data: converter.toFirestore(inputs),
    };

    const id = await addFunc(addInputs);

    return id;
  };
};

export { useGetHomeAudioList, useUploadHomeAudio };
