import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  useCollectionData,
  useCollectionDataOnce,
} from "react-firebase-hooks/firestore";
import {
  AddDocInputs,
  BaseFirestoreInputs,
  CollectionInputs,
} from "./interfaces";

const useGetCollectionOn = <T>(inputs: CollectionInputs<T>) => {
  const { db, path, pathSegments, converter } = inputs;
  const query = collection(db, path, ...pathSegments);
  const ref = query.withConverter(converter);
  const [values, loading, error] = useCollectionData(ref);

  return {
    values,
    loading,
    error,
  };
};

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

const useAddDoc = () => {
  return async (inputs: AddDocInputs) => {
    const { db, path, pathSegments, data } = inputs;

    const writeData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(
      collection(db, path, ...pathSegments),
      writeData
    );

    return docRef.id;
  };
};

const useUpdateDoc = () => {
  return async (inputs: AddDocInputs) => {
    const { db, path, pathSegments, data } = inputs;

    const writeData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, path, ...pathSegments), writeData);
  };
};

const useDeleteDoc = () => {
  return async (inputs: BaseFirestoreInputs) => {
    const { db, path, pathSegments } = inputs;

    await deleteDoc(doc(db, path, ...pathSegments));
  };
};

export {
  useGetCollectionOn,
  useGetCollectionOnce,
  useAddDoc,
  useUpdateDoc,
  useDeleteDoc,
};
