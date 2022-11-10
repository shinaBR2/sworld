import {
  collection,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import db from "../../providers/firestore";

interface AudioItem {
  id: string;
  src: string;
  name: string;
  artistName: string;
  image: string;
}

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

const useGetHomeAudioList = () => {
  const query = collection(db, "homeConfigs", "listen", "audioList");
  const ref = query.withConverter(converter);
  const [values, loading, error] = useCollectionDataOnce(ref);

  return {
    values,
    loading,
    error,
  };
};

export { useGetHomeAudioList };
