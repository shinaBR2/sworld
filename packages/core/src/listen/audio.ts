import { Firestore } from "firebase/firestore";
import { audioConverter } from "../entity/audio";
import { useGetCollectionOn } from "../universal/dbQuery";

const path = "homeConfigs";
const basePathSegments = ["listen", "audios"];

const useListenHomeAudioList = (db: Firestore) => {
  const inputs = {
    db,
    path,
    pathSegments: [...basePathSegments],
    converter: audioConverter,
  };
  const { values, loading, error } = useGetCollectionOn(inputs);

  return {
    values,
    loading,
    error,
  };
};

export { useListenHomeAudioList };
