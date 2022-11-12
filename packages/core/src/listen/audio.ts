import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { useGetCollectionOnce } from "../universal/dbQuery";
import { AudioItem } from "./interfaces";

const converter: FirestoreDataConverter<AudioItem> = {
  toFirestore: (data: AudioItem) => data,
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      src: data.src,
      name: data.name,
      artistName: data.artistName,
      image: data.thumbnailUrl,
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

export { useGetHomeAudioList };
