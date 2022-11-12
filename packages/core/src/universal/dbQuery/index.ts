import { collection } from "firebase/firestore";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { CollectionInputs } from "./interfaces";

const useGetCollectionOnce = <T>(inputs: CollectionInputs<T>) => {
  const { db, path, pathSegments, converter } = inputs;
  const query = collection(db, path, ...pathSegments);
  const ref = query.withConverter(converter);
  const [values, loading, error] = useCollectionDataOnce(ref);

  return {
    values,
    loading,
    error,
  };
};

export { useGetCollectionOnce };
